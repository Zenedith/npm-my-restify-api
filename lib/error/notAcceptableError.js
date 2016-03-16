'use strict';

var restify = require('restify');
var util = require('util');

var NotAcceptableError = function (message) {
  var statusCode = 406;
  restify.RestError.call(this, {
    restCode: 'NotAcceptableError',
    statusCode: statusCode,
    message: message,
    constructorOpt: NotAcceptableError
  });

  this.name = 'NotAcceptableError';
  this.body.statusCode = statusCode;
  this.body.userMessage = 'Twoja aplikacja nie jest aktualna';

};

util.inherits(NotAcceptableError, restify.RestError);

exports.NotAcceptableError = NotAcceptableError;