var restify = require('restify');
var util = require('util');

var InternalError = function (message) {
  restify.RestError.call(this, {
    restCode: 'InternalError',
    statusCode: 500,
    message: message,
    constructorOpt: InternalError
  });

  this.name = 'InternalError';
  this.body.userMessage = 'Serwer zwrócił nieznany błąd  - spróbuj ponownie za chwilę';

};

util.inherits(InternalError, restify.RestError);

exports.InternalError = InternalError;