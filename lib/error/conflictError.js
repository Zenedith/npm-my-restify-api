var restify = require('restify');
var util = require('util');

var ConflictError = function (message, userMessage) {
  restify.RestError.call(this, {
    restCode: 'ConflictError',
    statusCode: 409,
    message: message,
    constructorOpt: ConflictError
  });

  this.name = 'ConflictError';
  this.body.userMessage = userMessage || 'W systemie istnieje już taki zasób';

};

util.inherits(ConflictError, restify.RestError);

exports.ConflictError = ConflictError;