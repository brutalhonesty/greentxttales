var settings = require('../lib/controllers/settings');
var nano = require('nano')(settings.couchdb.url);
var colors = require('colors');
var storyView = {"views":{"all":{"map":"function(doc) {emit(null, doc) }","reduce":"_count"},"by_id":{"map":"function(doc) {emit(doc._id, doc) }","reduce":"_count"}}};
nano.db.create(settings.couchdb.stories, function (err, body) {
  if(err && err.status_code !== 412) {
    console.log(err);
    return;
  }
  var stories = nano.db.use(settings.couchdb.stories);
  stories.insert(storyView, '_design/stories', function (err) {
    // 409 is Document update conflict.
    if(err && err.status_code !== 409) {
      console.log('Error recreating database.'.red);
      console.log(err);
      return;
    }
    console.log('DB Installation successful.'.green);
  });
});