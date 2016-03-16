'use strict';

// Copyright 2013 Mark Cavage, Inc.  All rights reserved.
// Copyright 2015 Mateusz Stępniak, zenedith@wp.pl

var assert = require('assert-plus');

var EXPOSE_HEADERS = [
  'content-length',
  'request-id',
  'content-type'
];

var ALLOW_METHODS = [
  'GET',
  'POST',
  'DELETE',
  'PUT',
  'PATCH',
  'OPTIONS'
];

var ALLOW_HEADERS = [
  'content-length',
  'content-type',
  'authorization',
  'request-id',
  'accept'
];

var REQUEST_HEADERS = [
  'content-length',
  'content-type',
  'authorization',
  'origin',
  'accept'
];

var AC_ALLOW_CREDS = 'Access-Control-Allow-Credentials';
var AC_ALLOW_ORIGIN = 'Access-Control-Allow-Origin';
var AC_ALLOW_METHODS = 'Access-Control-Allow-Methods';
var AC_ALLOW_HEADERS = 'Access-Control-Allow-Headers';
var AC_REQUEST_HEADERS = 'Access-Control-Request-Headers';
var AC_EXPOSE_HEADERS = 'Access-Control-Expose-Headers';


function matchOrigin(req, origins) {
  var origin = req.headers.origin;

  function belongs(o) {
    if (origin === o || o === '*') {
      origin = o;
      return true;
    }

    return false;
  }

  return origin && origins.some(belongs) ? origin : false;
}

function cors(opts) {
  assert.optionalObject(opts, 'options');
  opts = opts || {};
  assert.optionalArrayOfString(opts.origins, 'options.origins');
  assert.optionalBool(opts.credentials, 'options.credentials');
  assert.optionalArrayOfString(opts.headers, 'options.headers');

  cors.credentials = opts.credentials;
  cors.origins = opts.origins || ['*'];

  var headers = (opts.headers || []).slice(0);
  var origins = opts.origins || ['*'];

  EXPOSE_HEADERS.forEach(function (h) {
    if (headers.indexOf(h) === -1) {
      headers.push(h);
    }
  });

  // Handler for simple requests
  function restifyCORSSimple(req, res, next) {
    var origin;
    if (!(origin = matchOrigin(req, origins))) {
      next();
      return;
    }

    function corsOnHeader() {
      origin = req.headers.origin;

      if (opts.credentials) {
        res.setHeader(AC_ALLOW_CREDS, 'true');
      }

      res.setHeader(AC_ALLOW_ORIGIN, origin);
      res.setHeader(AC_EXPOSE_HEADERS, headers.join(', '));
      res.setHeader(AC_ALLOW_METHODS, ALLOW_METHODS.join(', '));
      res.setHeader(AC_ALLOW_HEADERS, ALLOW_HEADERS.join(', '));
      res.setHeader(AC_REQUEST_HEADERS, REQUEST_HEADERS.join(', '));
    }

    res.once('header', corsOnHeader);
    next();
  }

  return restifyCORSSimple;
}


module.exports.cors = cors;
cors.credentials = false;
cors.origins = [];
cors.matchOrigin = matchOrigin;
