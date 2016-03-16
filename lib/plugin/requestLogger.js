'use strict';

// Copyright 2013 Mark Cavage, Inc.  All rights reserved.
// Copyright 2015 Mateusz Stępniak, zenedith@wp.pl

var assert = require('assert-plus');
var logger = require('../logger/logger').logger;

var requestLogger = function requestLogger(options) {
  assert.optionalObject(options);
  options = options || {};

  function reqLog(req, res, next) {

    var latency = res.get('Response-Time');
    if (typeof latency !== 'number') {
      latency = Date.now() - req._time;
    }

    var obj = {
      remoteAddress: req.connection.remoteAddress,
      remotePort: req.connection.remotePort,
      headers: req.headers,
      reqId: req.getId(),
      statusCode: res.statusCode,
      method: req.method,
      url: req.url,
      latency: latency,
      secure: req.secure || false
    };

    logger.info('request handled: %s', JSON.stringify(obj, null, 1));
    next();
  }

  return reqLog;
};

module.exports.requestLogger = requestLogger;
