// Copyright 2013 Mark Cavage, Inc.  All rights reserved.
// Copyright 2015 Mateusz Stępniak, zenedith@wp.pl

var jwt = require('jwt-simple');
//var httpSignature = require('http-signature');

var BadRequestError = require('../../error/badRequestError').BadRequestError;
var UnauthorizedError = require('../../error/notAuthorizedError').UnauthorizedError;


///--- Globals

//var BadRequestError = errors.BadRequestError;

var OPTIONS = {
  algorithms: [
    'rsa-sha1',
    'rsa-sha256',
    'rsa-sha512',
    'dsa-sha1',
    'hmac-sha1',
    'hmac-sha256',
    'hmac-sha512'
  ]
};


///--- Helpers

var parseBasic = function parseBasic(string) {
  var decoded;
  var index;
  var pieces;

  decoded = (new Buffer(string, 'base64')).toString('utf8');
  if (!decoded)
    throw new BadRequestError('Authorization header invalid');

  index = decoded.indexOf(':');
  if (index === -1) {
    pieces = [decoded];
  } else {
    pieces = [decoded.slice(0, index), decoded.slice(index + 1)];
  }

  if (!pieces || typeof (pieces[0]) !== 'string')
    throw new BadRequestError('Authorization header invalid');

  // Allows for usernameless authentication
  if (!pieces[0])
    pieces[0] = null;

  // Allows for passwordless authentication
  if (!pieces[1])
    pieces[1] = null;

  return ({
    username: pieces[0],
    password: pieces[1]
  });
};

var isExpiredBearer = function isExpiredBearer(decoded) {
  var epoch = parseInt(decoded.exp, 10);
  return new Date() > new Date(epoch * 1000);
};


var parseBearer = function parseBearer(string, options) {
  options = options || {};
  options.key = options.key || null;
  options.noVerify = options.noVerify || true;

  var decoded = jwt.decode(string, options.key, options.noVerify);
  if (!decoded) {
    throw new UnauthorizedError('Invalid authorization jwt token');
  }

  if (isExpiredBearer(decoded)) {
    throw new UnauthorizedError('Authorization token has expired');
  }

  return ({
    clientId: decoded['client_id'],
    userId: decoded['user_id'],
    username: decoded['user_name'],
    email: decoded['email'],
    scope: decoded['scope'],
    password: null
  });
};


var parseSignature = function parseSignature(request, options) {
  options = options || {};
  options.algorithms = OPTIONS.algorithms;
  try {
    return (httpSignature.parseRequest(request, options));
  } catch (e) {
    throw new BadRequestError('Authorization header invalid: ' +
      e.message);
  }
};


/**
 * Returns a plugin that will parse the client's Authorization header.
 *
 * Subsequent handlers will see `req.authorization`, which looks like:
 *
 * {
 *   scheme: <Basic|Signature|Bearer...>,
 *   credentials: <Undecoded value of header>,
 *   basic: {
 *     username: $user
 *     password: $password
 *   }
 * }
 *
 * `req.username` will also be set, and defaults to 'anonymous'.
 *
 * @return {Function} restify handler.
 * @throws {TypeError} on bad input
 */
var authorizationParser = function authorizationParser(options) {

  function parseAuthorization(req, res, next) {
    req.authorization = {};
    req.username = 'anonymous';

    if (!req.headers.authorization)
      return (next());

    var pieces = req.headers.authorization.split(' ', 2);


    if (!pieces || pieces.length !== 2) {
      var e = new BadRequestError('Authorization header is invalid.');
      return (next(e));
    }

    req.authorization.scheme = pieces[0];
    req.authorization.credentials = pieces[1];

    try {
      switch (pieces[0].toLowerCase()) {
        case 'basic':
          req.authorization.basic = parseBasic(pieces[1]);
          req.username = req.authorization.basic.username;
          break;

        case 'signature':
          req.authorization.signature =
            parseSignature(req, options);
          req.username =
            req.authorization.signature.keyId;
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
      return (next(e2));
    }

    return (next());
  }

  return (parseAuthorization);
};

module.exports.authorizationParser = authorizationParser;
