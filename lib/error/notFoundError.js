var restify = require('restify');
var util = require('util');

var NotFoundError = function (message) {
  restify.RestError.call(this, {
    restCode: 'NotFoundError',
    statusCode: 404,
    message: message,
    constructorOpt: NotFoundError
  });

  this.name = 'NotFoundError';
  this.body.userMessage = 'Nie znaleziono';

};

util.inherits(NotFoundError, restify.RestError);

exports.NotFoundError = NotFoundError;