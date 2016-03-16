'use strict';

// Copyright 2015 Mateusz Stępniak, zenedith@wp.pl
// etagify (https://github.com/lloyd/connect-etagify)

var assert = require('assert-plus');
var crypto = require('crypto');

var etag = function etag(options) {
  assert.optionalObject(options, 'options');

  // path to etag mapping
  var etags = {};

  // given a request, and a set of vary headers, generate a hash representing
  // the headers.
  function hashVaryHeaders(vary, req) {
    var hash = crypto.createHash('md5');

    vary.forEach(function (header) {
      if (req.headers[header]) {
        hash.update(req.headers[header]);
      }
    });

    return hash.digest(); // yes sir, we are using binary keys.
  }

  // given a request, see if we have an etag for it
  function getETag(r) {
    var tag;

    if (etags.hasOwnProperty(r.url)) {
      if (etags[r.url].vary) {
        var hash = hashVaryHeaders(etags[r.url].vary, r);
        tag = etags[r.url].md5s[hash];
      } else {
        tag = etags[r.url].md5;
      }
    }

    return tag;
  }

  function etagResponse(req, res, next) {

    // if there's an ETag already on the response, do nothing
    if (res.header('ETag')) {
      next();
      return;
    }

    var tag = getETag(req);
    if (tag) {
      res.setHeader('ETag', tag);
      next();
      return;
    }

    var origWrite = res.write;
    var origEnd = res.end;

    // otherwise, eavsedrop on the outbound response and generate a
    // content-based hash.
    var hash = crypto.createHash('md5');

    res.write = function (chunk) {
      hash.update(chunk);
      origWrite.call(res, chunk);
    };

    res.end = function (body) {
      if (body) {
        hash.update(body);
      }

      var vary = res.getHeader('vary');

      if (vary) {

        if (!etags[req.url]) {

          etags[req.url] = {
            vary: vary.split(',').map(function (x) {
              return x.trim().toLowerCase();
            }),
            md5s: {}
          };
        }

        var hdrhash = hashVaryHeaders(etags[req.url].vary, req);
        etags[req.url].md5s[hdrhash] = hash.digest('hex');
      } else {
        etags[req.url] = {md5: hash.digest('hex')};
      }
      origEnd.apply(res, arguments);
    };

    next();
  }

  return etagResponse;
};

module.exports.etag = etag;
