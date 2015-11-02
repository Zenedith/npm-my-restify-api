var restify = require('restify');
var util = require('util');

var UnauthorizedError = function (message) {
  var statusCode = 401;
  restify.RestError.call(this, {
    restCode: 'UnauthorizedError',
    statusCode: statusCode,
    message: message,
    constructorOpt: UnauthorizedError
  });

  this.name = 'UnauthorizedError';
  this.body.statusCode = statusCode;
  this.body.userMessage = 'Aplikacja wymaga autoryzacji';

};

util.inherits(UnauthorizedError, restify.RestError);

exports.UnauthorizedError = UnauthorizedError;