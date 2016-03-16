'use strict';

var restify = require('restify');
var util = require('util');

var MethodNotAllowedError = function (message) {
  var statusCode = 405;
  restify.RestError.call(this, {
    restCode: 'MethodNotAllowedError',
    statusCode: statusCode,
    message: message,
    constructorOpt: MethodNotAllowedError
  });

  this.name = 'MethodNotAllowedError';
  this.body.statusCode = statusCode;
  this.body.userMessage = 'Twoja aplikacja nie jest aktualna';

};

util.inherits(MethodNotAllowedError, restify.RestError);

exports.MethodNotAllowedError = MethodNotAllowedError;