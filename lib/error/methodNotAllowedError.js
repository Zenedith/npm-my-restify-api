var restify = require('restify');
var util = require('util');

var MethodNotAllowedError = function (message) {
  restify.RestError.call(this, {
    restCode: 'MethodNotAllowedError',
    statusCode: 405,
    message: message,
    constructorOpt: MethodNotAllowedError
  });

  this.name = 'MethodNotAllowedError';
  this.body.userMessage = 'Twoja aplikacja nie jest aktualna';

};

util.inherits(MethodNotAllowedError, restify.RestError);

exports.MethodNotAllowedError = MethodNotAllowedError;