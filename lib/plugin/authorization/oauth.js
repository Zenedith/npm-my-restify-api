var assert = require('assert-plus');
var logger = require('../../logger/logger').logger;
var ForbiddenError = require('../../error/forbiddenError').ForbiddenError;
var UnauthorizedError = require('../../error/notAuthorizedError').UnauthorizedError;

exports.oauth = function (req, next) {
  var failed = false;
  var context = {};

  context.user = function () {
    if (failed) {
      return context;
    }

    try {
      assert.string(req.authorization.bearer.userId, 'authorization.req.authorization.bearer.userId');
      assert.string(req.authorization.bearer.username, 'authorization.req.authorization.bearer.username');
      assert.string(req.authorization.bearer.email, 'authorization.req.authorization.bearer.email');
    }
    catch (e) {
      logger.info('Unauthorized user:', e);
      next(new UnauthorizedError('Unauthorized user token'));
      failed = true;
    }

    return context;
  };

  context.client = function (client) {
    if (failed) {
      return context;
    }

    logger.debug('Looking for clientId in authorization: "%s"', client);

    try {
      assert.string(req.authorization.bearer.clientId, 'authorization.req.authorization.bearer.clientId');
    }
    catch (e) {
      logger.info('Unauthorized client:', e);
      next(new UnauthorizedError('Unauthorized client'));
      failed = true;
    }

    if (failed) {
      return context;
    }

    if (req.authorization.bearer.clientId) {
      if (client === req.authorization.bearer.clientId) {
        return context;
      }
    }

    logger.info('Invalid clientId in oauth authorization: "%s"', client);
    next(new UnauthorizedError('Invalid oauth authorization clientId'));
    failed = true;
    return context;
  };

  context.scope = function (scope, userMessage) {
    if (failed) {
      return context;
    }

    logger.debug('Looking for scope in authorization:', scope);

    if (req.authorization.bearer.scope) {
      for (var i in req.authorization.bearer.scope) {
        var bearerScope = req.authorization.bearer.scope[i];
        if (scope === bearerScope) {
          return context;
        }
      }
    }

    logger.info('Invalid scope in oauth authorization: "%s"', scope);
    next(new ForbiddenError('Invalid oauth authorization scope.', userMessage));
    failed = true;
    return context;
  };

  context.next = function () {
    return next();
  };

  try {
    assert.object(req.authorization, 'authorization');
    assert.object(req.authorization.bearer, 'authorization.bearer');
  }
  catch (e) {
    logger.info('Missing authorization header:', e);
    next(new UnauthorizedError('Missing authorization header'));
    failed = true;
  }

  return context;
};

module.exports = exports;