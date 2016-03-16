'use strict';

// Copyright 2013 Mark Cavage, Inc.  All rights reserved.
// Copyright 2015 Mateusz Stępniak, zenedith@wp.pl

var logger = require('../../logger/logger').logger;
var jwt = require('jwt-simple');

var BadRequestError = require('../../error/badRequestError').BadRequestError;
var UnauthorizedError = require('../../error/notAuthorizedError').UnauthorizedError;


var parseBasic = function parseBasic(string) {
  var decoded;
  var index;
  var pieces;

  decoded = (new Buffer(string, 'base64')).toString('utf8');
  if (!decoded) {
    throw new BadRequestError('Authorization header invalid');
  }

  index = decoded.indexOf(':');
  if (index === -1) {
    pieces = [decoded];
  } else {
    pieces = [decoded.slice(0, index), decoded.slice(index + 1)];
  }

  if (!pieces || typeof pieces[0] !== 'string') {
    throw new BadRequestError('Authorization header invalid');
  }

  // Allows for usernameless authentication
  if (!pieces[0]) {
    pieces[0] = null;
  }

  // Allows for passwordless authentication
  if (!pieces[1]) {
    pieces[1] = null;
  }

  return {
    username: pieces[0],
    password: pieces[1]
  };
};

var isExpiredBearer = function isExpiredBearer(decoded) {
  var epoch = parseInt(decoded.exp, 10);
  return new Date() > new Date(epoch * 1000);
};


var parseBearer = function parseBearer(string, options) {
  var decoded = null;

  try {
    decoded = jwt.decode(string, options.key, options.noVerify);
    if (!decoded) {
      logger.info('Unable to decode token: %s', string);
      throw new UnauthorizedError('Invalid authorization jwt token');
    }
  }
  catch (e) {
    logger.info('Unable to decode token:', e);
    throw new UnauthorizedError('Invalid authorization jwt token');
  }

  if (isExpiredBearer(decoded)) {
    throw new UnauthorizedError('Authorization token has expired');
  }

  return {
    clientId: decoded.client_id,
    userId: decoded.user_id,
    username: decoded.user_name,
    email: decoded.email,
    scope: decoded.scope,
    password: null
  };
};


var getHeaderValue = function (req, key) {
  return req.headers[key];
};

var checkCustomAuthHeaders = function (req, prefix) {
  var scopes = getHeaderValue(req, prefix + 'scope');

  if (scopes) {
    scopes = scopes.split(', ');
  }

  var auth = {
    clientId: getHeaderValue(req, prefix + 'client-id'),
    userId: getHeaderValue(req, prefix + 'user-id'),
    username: getHeaderValue(req, prefix + 'username'),
    email: getHeaderValue(req, prefix + 'email'),
    scope: scopes,
    password: getHeaderValue(req, prefix + 'password')
  };

  if (!auth.clientId && !auth.userId && !auth.username && !auth.email && !auth.scope && !auth.password) {
    return false;
  }

  req.authorization = {};
  req.username = auth.username;
  req.authorization.scheme = getHeaderValue(req, prefix + 'scheme');
  req.authorization.credentials = '';
  req.authorization.basic = auth;
  req.authorization.bearer = auth;

  return true;
};

/**
 * Returns a plugin that will parse the client's Authorization header.
 *
 * Subsequent handlers will see `req.authorization`, which looks like:
 *
 * {
 *   scheme: <Basic|Bearer...>,
 *   credentials: <Undecoded value of header>,
 *   basic: {
 *     username: $user
 *     password: $password
 *   }
 * }
 *
 * `req.username` will also be set, and defaults to 'anonymous'.
 * @param {Object} options - options
 * @returns {Function} restify handler.
 * @throws {TypeError} on bad input
 */
var authorizationParser = function authorizationParser(options) {
  options = options || {};
  options.key = options.key || null;
  options.noVerify = options.noVerify || true;
  options.authHeaderPrefix = options.authHeaderPrefix || '';

  function parseAuthorization(req, res, next) {

    if (checkCustomAuthHeaders(req, options.authHeaderPrefix)) {
      return next();
    }

    req.authorization = {};
    req.username = 'anonymous';

    if (!req.headers.authorization) {
      return next();
    }

    var pieces = req.headers.authorization.split(' ', 2);

    if (!pieces || pieces.length !== 2) {
      var e = new BadRequestError('Authorization header is invalid.');
      return next(e);
    }

    req.authorization.scheme = pieces[0];
    req.authorization.credentials = pieces[1];

    try {
      switch (pieces[0].toLowerCase()) {
        case 'basic':
          req.authorization.basic = parseBasic(pieces[1]);
          req.username = req.authorization.basic.username;
          break;

        case 'bearer':
          req.authorization.bearer =
            parseBearer(pieces[1], options);
          req.username =
            req.authorization.bearer.username;
          break;

        default:
          break;
      }
    } catch (e2) {
      return next(e2);
    }

    return next();
  }

  return parseAuthorization;
};

module.exports.authorizationParser = authorizationParser;
