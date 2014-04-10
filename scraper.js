var express = require('express');
var settings = require('./lib/controllers/settings');
var config = require('./lib/config/config');
var chan = require('4chanjs');
var nano = require('nano')(settings.couchdb.url);
var storiesDB = nano.use(settings.couchdb.stories);
var cheerio = require('cheerio');
var path = require('path');
var request = require('request');

var app = express();
var ipAddr = settings.scraper.ip;
var scraperPort = settings.scraper.port;
var serverPort = config.port;

function getData(callback) {
  var random = chan.board('b');
  random.catalog(function(error, pages){
    if(error) {
      return callback(error);
    }
    if(pages && pages.length > 0) {
      var threads = pages[0]['threads'];
      var threadObjArray = [];
      var counter = 0;
      var errorCounter = 0;
      if(threads) {
        for(var threadCounter = 0; threadCounter < threads.length; threadCounter++) {
          var thread = threads[threadCounter];
          if(thread.filedeleted == true) {// 1 == true
            errorCounter++;
            continue;
          }
          var comment = thread.com;
          var image = random.image(thread.tim, thread.ext);
          if(image === null) {
            errorCounter++;
            console.log('Error from 4chan image');
            console.log(JSON.stringify(thread));
            continue;
          }
          //console.log('DEBUG: Image URL: ' + image);
          if(comment !== undefined) {
            var firstIndex = comment.indexOf('<span class=\"quote\">&gt;');
            var lastIndex = comment.lastIndexOf('<span class=\"quote\">&gt;');
            //console.log('First Index ' + firstIndex);
            //console.log('Last Index ' + lastIndex);
            if(firstIndex >= 0 && lastIndex >= 0 && firstIndex !== lastIndex) {
              if(error) return callback(error);
              manipData(comment, image, thread.tim, function (errors, threadObj) {
                if(errors) {
                  return callback(errors);
                }
                counter++;
                if(threadObj) {
                  threadObjArray.push(threadObj);
                }
                if(counter === threads.length) {
                  return callback(null, threadObjArray);
                }
              });
            } else {
              counter++;
              // If we have any errors, we still wanna hit the amount
              if(counter === (threads.length - errorCounter)) {
                return callback(null, threadObjArray);
              }
            }
          } else {
            // Thread has no comment
            //console.log('Thread has no comment');
            counter++;
            if(counter === threads.length) {
              return callback(null, threadObjArray);
            }
          }
          //console.log("counter:" + counter);
          //console.log("threads.length: " + threads.length);
        }
      }
    }
  });
}

function manipData(comment, image, id, callback) {
  var threadObj = {};
  // Take the story and strip down to green text
  $ = cheerio.load('<body>'+comment+'</body>');
  var greenTextArray = [];
  var addedFront = false;
  // If the story does not start with >, then they have some context that wanna show first
  if($('body').text().indexOf('>') !== 0) {
    addedFront = true;
    greenTextArray.push($('body').text().substring(0, $('body').text().indexOf('>')));
    //console.log('DEBUG: Added front sentence: ');
    //console.log(greenTextArray);
  }
  // Grab each > line and store into array
  var storeStory = false;
  $('body').children('span.quote').each(function (index) {
    var line = $(this).text();
    if(index === 0 && line.toLowerCase().indexOf('> be ') === 0 || line.toLowerCase().indexOf('>be ') === 0) {
      storeStory = true;
    }
    if(storeStory) {
      greenTextArray.push(line);
    }
  });
  if(!storeStory) {
    return callback(null, null);
  }
  // Get all the text in the body thats not in a html tag
  var text = $('body').contents().filter(function () {
    return this.nodeType == 3;
  }).text();
  if(addedFront) {
    //console.log('DEBUG: Text: ' + text);
    if(text.indexOf(greenTextArray[0]) >= 0) {
      text = text.substring(text.indexOf(greenTextArray[0]) + greenTextArray[0].length);
    }
    if(text.length > 0) {
      greenTextArray.push(text);
    }
  }
  //console.log('****DEBUG: GreenTextArray*** ');
  //console.log(greenTextArray);
  threadObj.image = image;
  threadObj.id = id;
  threadObj.text = greenTextArray;
  return callback(null, threadObj);
}

setInterval(function () {
  getData(function (error, stories) {
    if(error) {
      console.log(error);
      return;
    }
    //console.log('Source data: ');
    //console.log(stories);
    if(stories.length > 0) {
      // Store to CouchDB
      for(var stryCtr = 0; stryCtr < stories.length; stryCtr++) {
        // TODO This post id is not being registered as already added so we are adding additional of the same story.
        storiesDB.insert(stories[stryCtr], stories[stryCtr].id, function (err) {
          if(err) {
            console.log(err);
            // We return because if the insertion failed once, it's gonna fail on the rest.
            return;
          }
        });
      }
    }
  });
}, 2000);

app.get('/ping', function (req, res) {
  res.json({message: 'healthy'});
});

app.listen(scraperPort, ipAddr, function () {
  console.log("Scraper has started on ip " + ipAddr + " on port " + scraperPort);
});