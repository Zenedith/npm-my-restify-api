var assert = require('assert-plus');
var logger = require('../../logger/logger').logger;
var ForbiddenError = require('../../error/forbiddenError').ForbiddenError;
var UnauthorizedError = require('../../error/notAuthorizedError').UnauthorizedError;

exports.oauth = function (req, next) {
  try {
    assert.object(req.authorization, 'authorization');
    assert.object(req.authorization.bearer, 'authorization.bearer');
  }
  catch (e) {
    logger.info('Unauthorized:', e);
    return next(new UnauthorizedError('Unauthorized'));
  }

  var bearer = req.authorization.bearer;

  try {
    assert.string(bearer.clientId, 'authorization.bearer.clientId');
  }
  catch (e) {
    logger.info('Unauthorized client:', e);
    return next(new UnauthorizedError('Unauthorized client'));
  }

  var context = {};
  context.user = function () {

    try {
      assert.string(bearer.userId, 'authorization.bearer.userId');
      assert.string(bearer.username, 'authorization.bearer.username');
      assert.string(bearer.email, 'authorization.bearer.email');
    }
    catch (e) {
      logger.info('Unauthorized user:', e);
      return next(new UnauthorizedError('Unauthorized user token'));
    }
  };

  context.client = function (client) {
    logger.debug('Looking for clientId in authorization: "%s"', client);

    if (bearer.clientId) {
      if (client === bearer.clientId) {
        return context;
      }
    }

    logger.info('Invalid clientId in oauth authorization: "%s"', client);
    return next(new UnauthorizedError('Invalid oauth authorization clientId'));
  };

  context.scope = function (scope, userMessage) {
    logger.debug('Looking for scope in authorization:', scope);

    if (bearer.scope) {
      for (var i in bearer.scope) {
        var bearerScope = bearer.scope[i];
        if (scope === bearerScope) {
          return context;
        }
      }
    }

    logger.info('Invalid scope in oauth authorization: "%s"', scope);
    return next(new new ForbiddenError('Invalid oauth authorization scope.', userMessage));
  };

  context.next = function () {
    return next();
  };

  return context;
};

module.exports = exports;