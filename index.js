var meta = require('./lib/meta');
var app = require('./lib/app');

var exports = {};

exports.error = {
  BadRequestError: require('./lib/error/badRequestError').BadRequestError,
  ForbiddenError: require('./lib/error/forbiddenError').ForbiddenError,
  InternalError: require('./lib/error/internalError').InternalError,
  UnauthorizedError: require('./lib/error/notAuthorizedError').UnauthorizedError,
  NotFoundError: require('./lib/error/notFoundError').NotFoundError,
  ServiceUnavailableError: require('./lib/error/serviceUnavailableError').ServiceUnavailableError
};

exports.plugin = {
  oauth: require('./lib/plugin/authorization/oauth').oauth
};

exports.runServer = app.runServer;
exports.VERSION = meta.VERSION;

module.exports = exports;