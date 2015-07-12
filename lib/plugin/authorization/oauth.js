var assert = require('assert-plus');
var logger = require('../../logger/logger').logger;

exports.oauth = function (req) {

  assert.object(req.authorization, 'authorization');
  assert.object(req.authorization.bearer, 'authorization.bearer');
  var bearer = req.authorization.bearer;
  assert.string(bearer.clientId, 'authorization.bearer.clientId');

  var context = {};
  context.user = function () {

    try {
      assert.string(bearer.userId, 'authorization.bearer.userId');
      assert.string(bearer.username, 'authorization.bearer.username');
      assert.string(bearer.email, 'authorization.bearer.email');
    }
    catch (e) {
      logger.info('Unauthorized user:', e);
      throw new Error('Unauthorized user token');
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
    throw new Error('Invalid oauth authorization clientId');
  };

  context.scope = function (scope) {
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
    throw new Error('Invalid oauth authorization scope.');
  };

  return context;
};

module.exports = exports;