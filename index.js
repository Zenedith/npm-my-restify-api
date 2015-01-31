var meta = require('./lib/meta');
var app = require('./lib/app');

var exports = {};

exports.error = {
  InternalError: require('./lib/error/internalError').InternalError,
  NotFoundError: require('./lib/error/notFoundError').NotFoundError,
  BadRequestError: require('./lib/error/badRequestError').BadRequestError,
  ForbiddenError: require('./lib/error/forbiddenError').ForbiddenError
};

exports.runServer = app.runServer;
exports.VERSION = meta.VERSION;

module.exports = exports;