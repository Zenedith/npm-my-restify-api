'use strict';

// Copyright 2013 Mark Cavage, Inc.  All rights reserved.
// Copyright 2015 Mateusz Stępniak, zenedith@wp.pl

var assert = require('assert-plus');
var mime = require('mime');
var NotAcceptableError = require('../../error/notAcceptableError').NotAcceptableError;
var VERSION_FORMAT = '^application/vnd\..+.v(\\d)\\+(.+)$';

var acceptParser = function (acceptable) {

  if (!Array.isArray(acceptable)) {
    acceptable = [acceptable];
  }

  assert.arrayOfString(acceptable, 'acceptable');

  acceptable = acceptable.filter(function (a) {
    return a;
  }).map(function (a) {
    return a.indexOf('/') === -1 ? mime.lookup(a) : a;
  }).filter(function (a) {
    return a;
  });

  var e = new NotAcceptableError('Server accepts: ' + acceptable.join());

  function parseAccept(req, res, next) {
    var accept = req.headers.accept;

    if (accept) {
      var match = accept.match(VERSION_FORMAT);

      if (match) {
        req.headers['accept-version'] = '~' + match[1];
        req.headers.accept = mime.lookup(match[2]);
        req.headers['x-accept'] = accept;

        if (req.headers.accept) {
          return next();
        }
      }
    }

    if (req.accepts(acceptable)) {
      return next();
    }

    res.json(e);
    next(false);
  }

  return parseAccept;
};

module.exports.acceptParser = acceptParser;
