'use strict';

var meta = require('./lib/meta');
var app = require('./lib/app');

module.exports = {
  error: {
    BadRequestError: require('./lib/error/badRequestError').BadRequestError,
    ForbiddenError: require('./lib/error/forbiddenError').ForbiddenError,
    InternalError: require('./lib/error/internalError').InternalError,
    UnauthorizedError: require('./lib/error/notAuthorizedError').UnauthorizedError,
    NotFoundError: require('./lib/error/notFoundError').NotFoundError,
    ServiceUnavailableError: require('./lib/error/serviceUnavailableError').ServiceUnavailableError
  },

  plugin: {
    oauth: require('./lib/plugin/authorization/oauth').oauth
  },

  runServer: app.runServer,
  createServer: app.createServer,

  VERSION: meta.VERSION
};