var restify = require('restify');
var util = require('util');

var ForbiddenError = function (message, userMessage) {
  var statusCode = 403;
  restify.RestError.call(this, {
    restCode: 'ForbiddenError',
    statusCode: statusCode,
    message: message,
    constructorOpt: ForbiddenError
  });

  this.name = 'ForbiddenError';
  this.body.statusCode = statusCode;
  this.body.userMessage = userMessage || 'Nie możesz wykonać tej akcji';

};

util.inherits(ForbiddenError, restify.RestError);

exports.ForbiddenError = ForbiddenError;