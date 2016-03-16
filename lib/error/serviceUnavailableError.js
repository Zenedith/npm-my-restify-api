'use strict';

var restify = require('restify');
var util = require('util');

var ServiceUnavailableError = function (message, userMessage) {
  var statusCode = 503;
  restify.RestError.call(this, {
    restCode: 'ServiceUnavailableError',
    statusCode: statusCode,
    message: message,
    constructorOpt: ServiceUnavailableError
  });

  this.name = 'ServiceUnavailableError';
  this.body.statusCode = statusCode;
  this.body.userMessage = userMessage || 'Serwis jest chwilowo niedostępny  - spróbuj ponownie za chwilę';

};

util.inherits(ServiceUnavailableError, restify.RestError);

exports.ServiceUnavailableError = ServiceUnavailableError;