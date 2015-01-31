var restify = require('restify');
var util = require('util');

var UnauthorizedError = function (message) {
  restify.RestError.call(this, {
    restCode: 'UnauthorizedError',
    statusCode: 401,
    message: message,
    constructorOpt: UnauthorizedError
  });

  this.name = 'UnauthorizedError';
  this.body.userMessage = 'Aplikacja wymaga autoryzacji';

};

util.inherits(UnauthorizedError, restify.RestError);

exports.UnauthorizedError = UnauthorizedError;