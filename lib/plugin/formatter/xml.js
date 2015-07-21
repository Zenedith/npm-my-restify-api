// Copyright 2013 Mark Cavage, Inc.  All rights reserved.
// Copyright 2015 Mateusz Stępniak, zenedith@wp.pl

var jstoxml = require('jstoxml');

var formatXml = function (req, res, body) {
  if (body instanceof Error) {
    res.statusCode = body.statusCode || 500;

    if (body.body) {
      body = body.body;
    } else {
      body = {
        message: body.message
      };
    }
  } else if (Buffer.isBuffer(body)) {
    body = body.toString('base64');
  }

  res.contentType = 'xml';

  var data = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><response>' + jstoxml.toXML(body) + '</response>';
  res.setHeader('Content-Length', Buffer.byteLength(data));

  return (data);
};

module.exports.formatXml = formatXml;
