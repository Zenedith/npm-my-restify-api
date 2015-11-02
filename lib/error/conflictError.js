var restify = require('restify');
var util = require('util');

var ConflictError = function (message, userMessage) {
  var statusCode = 409;
  restify.RestError.call(this, {
    restCode: 'ConflictError',
    statusCode: statusCode,
    message: message,
    constructorOpt: ConflictError
  });

  this.name = 'ConflictError';
  this.body.statusCode = statusCode;
  this.body.userMessage = userMessage || 'W systemie istnieje już taki zasób';

};

util.inherits(ConflictError, restify.RestError);

exports.ConflictError = ConflictError;