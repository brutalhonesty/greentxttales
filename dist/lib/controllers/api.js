'use strict';
var validator = require('validator');
var settings = require('./settings');
var nano = require('nano')(settings.couchdb.url);
var stories = nano.use(settings.couchdb.stories);

/**
 * @api {get} /api/getData Get page "n"
 * @apiVersion 0.0.1
 * @apiName GetData
 * @apiGroup API
 * @apiPermission public
 *
 * @apiDescription Returns a page worth of data for the Green Txt Site to display.
 *
 * @apiParam {string} page The current page that the user is requesting.
 *
 * @apiSuccess {string} image The url to the image of the story.
 * @apiSuccess {int} id The unique ID of the story.
 * @apiSuccess {array} text The array containing the story.
 *
 * @apiSuccessExample Success-Response (example):
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *        "image": "//i.4cdn.org/b/src/1386962597748.jpg",
 *        "id": 1386962597748,
 *        "text": [
 *          "Who is the biggest looser online right now?I'll start",
 *          ">be 34",
 *          ">fat",
 *          ">no friends",
 *          ">socially inapt",
 *          ">no money, unemployed most of my adult life",
 *          ">moody",
 *          ">huge video games and fiction geek",
 *          ">spending all my time in front of computer",
 *          ">not leaving house generally",
 *          ">hasn't showered for few days",
 *          ">hasn't shaved this week",
 *          ">living with my gf who supports me"
 *        ]
 *      },
 *      {...}
 *    ]
 *
 * @apiError GeneralError Issue with something in the request or processing of data.
 * @apiErrorExample Error-Response (example):
 *     HTTP/1.1 500 Service Unavailable
 *     {
 *       "message": "Issue returning page contents."
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Missing page value."
 *     }
 */
exports.getData = function(req, res) {
  var page = req.query.page;
  if (!page) {
    return res.json(400, {message: 'Missing page value.'});
  }
  if (!validator.isInt(page)) {
    return res.json(400, {message: 'Invalid page value.'});
  }
  stories.view('stories', 'all', {reduce: false, limit: page * 25}, function (error, reply) {
    if (error) {
      console.log(error);
      return res.json(500, {message: 'Issue returning page contents.'});
    }
    return res.json(reply.rows);
  });
};

/**
 * @api {get} /api/storyCacheTotal Redis Key Total
 * @apiVersion 0.0.1
 * @apiName StoryCacheTotal
 * @apiGroup API
 * @apiPermission public
 *
 * @apiDescription Returns total number of Redis keys in the server
 *
 * @apiSuccess {int} total The total number of redis keys currently in storage.
 *
 * @apiSuccessExample Success-Response (example):
 *     HTTP/1.1 200 OK
 *     {
 *      total: 200
 *     }
 *
 * @apiError GeneralError Issue with something in the request or processing of data.
 * @apiErrorExample Error-Response (example):
 *     HTTP/1.1 500 Service Unavailable
 *     {
 *       "message": "Could not calculate story total."
 *     }
 */
exports.storyCacheTotal = function(req, res) {
  stories.view('stories', 'all', function(error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Could not calculate story total.'});
    }
    return res.json({"total": reply.rows[0].value});
  });
};