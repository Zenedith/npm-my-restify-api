var meta = require('./lib/meta');
var app = require('./lib/app');

var exports = {};
exports.runServer = app.runServer;
exports.VERSION = meta.VERSION;

module.exports = exports;