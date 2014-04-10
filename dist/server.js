'use strict';

var express = require('express');
var cp = require('child_process');
var child = cp.fork(__dirname + '/scraper.js');

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application Config
var config = require('./lib/config/config');

var app = express();

// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app);

// Start server
app.listen(config.port, function () {
  console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
});

// Send all uncaught errors to console and exit
process.on('uncaughtException', function (error) {
  console.log(error);
  process.exit(1);
});

// Expose app
exports = module.exports = app;