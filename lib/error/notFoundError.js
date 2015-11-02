var restify = require('restify');
var util = require('util');

var NotFoundError = function (message, userMessage) {
  restify.RestError.call(this, {
    restCode: 'NotFoundError',
    statusCode: 404,
    message: message,
    constructorOpt: NotFoundError
  });

  this.name = 'NotFoundError';
  this.body.statusCode = statusCode;
  this.body.userMessage = userMessage || 'Nie znaleziono';

};

util.inherits(NotFoundError, restify.RestError);

exports.NotFoundError = NotFoundError;