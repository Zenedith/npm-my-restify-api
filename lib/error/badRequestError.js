var restify = require('restify');
var util = require('util');

var BadRequestError = function (message, userMessage, field) {
  var statusCode = 400;
  restify.RestError.call(this, {
    restCode: 'BadRequestError',
    statusCode: statusCode,
    message: message,
    constructorOpt: BadRequestError
  });

  this.name = 'BadRequestError';
  this.body.statusCode = statusCode;
  this.body.field = field || null;
  this.body.userMessage = userMessage || 'Przekazane dane są niepoprawne lub niepełne';

};

util.inherits(BadRequestError, restify.RestError);

exports.BadRequestError = BadRequestError;