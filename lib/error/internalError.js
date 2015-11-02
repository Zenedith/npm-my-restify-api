var restify = require('restify');
var util = require('util');

var InternalError = function (message) {
  var statusCode = 500;
  restify.RestError.call(this, {
    restCode: 'InternalError',
    statusCode: statusCode,
    message: message,
    constructorOpt: InternalError
  });

  this.name = 'InternalError';
  this.body.statusCode = statusCode;
  this.body.userMessage = 'Serwis zwrócił nieznany błąd  - spróbuj ponownie za chwilę';

};

util.inherits(InternalError, restify.RestError);

exports.InternalError = InternalError;