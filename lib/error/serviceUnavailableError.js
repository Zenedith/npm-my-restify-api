var restify = require('restify');
var util = require('util');

var ServiceUnavailableError = function (message, userMessage) {
  restify.RestError.call(this, {
    restCode: 'ServiceUnavailableError',
    statusCode: 503,
    message: message,
    constructorOpt: ServiceUnavailableError
  });

  this.name = 'ServiceUnavailableError';
  this.body.userMessage = userMessage
    || 'Serwis jest chwilowo niedostępny  - spróbuj ponownie za chwilę';

};

util.inherits(ServiceUnavailableError, restify.RestError);

exports.ServiceUnavailableError = ServiceUnavailableError;