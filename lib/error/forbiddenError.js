var restify = require('restify');
var util = require('util');

var ForbiddenError = function (message, userMessage) {
  restify.RestError.call(this, {
    restCode: 'ForbiddenError',
    statusCode: 403,
    message: message,
    constructorOpt: ForbiddenError
  });

  this.name = 'ForbiddenError';
  this.body.userMessage = userMessage || 'Nie możesz wykonać tej akcji';

};

util.inherits(ForbiddenError, restify.RestError);

exports.ForbiddenError = ForbiddenError;