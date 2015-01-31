var restify = require('restify');
var logger = require('./logger/logger').logger;
var acceptParser = require('./plugin/accept/acceptParser').acceptParser;
var formatXml = require('./plugin/formatter/xml').formatXml;
var InternalError = require('./error/internalError').InternalError;
var NotFoundError = require('./error/notFoundError').NotFoundError;
var BadRequestError = require('./error/badRequestError').BadRequestError;
var ForbiddenError = require('./error/forbiddenError').ForbiddenError;
var ServiceUnavailableError = require('./error/serviceUnavailableError').ServiceUnavailableError;
var MethodNotAllowedError = require('./error/methodNotAllowedError').MethodNotAllowedError;
var NotFoundError = require('./error/notFoundError').NotFoundError;
var UnauthorizedError = require('./error/notAuthorizedError').UnauthorizedError;
var cors = require('./plugin/cors').cors;

exports.runServer = function (routesMethods, errorHandlers, options, callback) {

  routesMethods = routesMethods || {};
  errorHandlers = errorHandlers || {};
  options = options || {};
  options.appName = options.appName || 'API';
  options.swagger = options.swagger || {};
  options.swagger.enabled = options.swagger.enabled || false;
  options.swagger.apiDocsDir = options.swagger.apiDocsDir || false;

  var server = restify.createServer(
    {
      name: options.appName,
      formatters: {
        'application/xml': formatXml
      }
    }
  );

  server.on('uncaughtException', function (req, res, route, e) {
    if (res._headerSent) {
      return (false);
    }

    logger.error(e);

    res.send(new InternalError(e.message || 'unexpected error'));
    return (true);
  });

  server.on('MethodNotAllowed', function (req, res, err) {
    res.send(new MethodNotAllowedError(req.method + ' is not allowed for resource ' + req._url.pathname));
    return (true);
  });

  server.on('Unauthorized', function (req, res, err) {
    res.send(new UnauthorizedError(err.message));
    return (true);
  });

  server.on('Internal', function (req, res, err) {
    res.send(new InternalError(e.message || 'unexpected error'));
    return (true);
  });

  server.on('NotFound', function (req, res, err) {
    res.send(new NotFoundError('Not found resource ' + req._url.pathname));
    return (true);
  });

  for (var errorName in errorHandlers) {
    if (errorHandlers.hasOwnProperty(errorName)) {
      var handler = errorHandlers[errorName];

      logger.debug('Added error handler for "%s"', errorName, handler);

      server.on(errorName, function (req, res, err) {

        var errorResponse;

        switch (handler.class) {
          case 'NotFoundError' :
            errorResponse = new NotFoundError(err.message);
            break;
          case 'BadRequestError' :
            errorResponse = new BadRequestError(err.message);
            break;
          case 'ForbiddenError' :
            errorResponse = new ForbiddenError(err.message);
            break;
          case 'ServiceUnavailableError' :
            errorResponse = new ServiceUnavailableError(err.message);
            break;
          default :
            errorResponse = new InternalError(err.message);
        }

        res.send(errorResponse);
        return (true);
      });
    }
  }

  server.acceptable.push('application/vnd.vehicle-history.v1+json');
  server.acceptable.push('application/vnd.vehicle-history.v1+xml');

  server.pre(acceptParser(server.acceptable));
  server.pre(restify.pre.userAgentConnection());  //curl fix
  server.pre(restify.pre.sanitizePath());
  server.use(cors());


//server.use(restify.authorizationParser());
//server.use(restify.dateParser());
  server.use(restify.queryParser());


  for (var method in routesMethods) {
    if (routesMethods.hasOwnProperty(method)) {
      var routers = routesMethods[method];

      for (var i in routers) {
        if (routers.hasOwnProperty(i)) {
          var route = routers[i];

          server[method](route.options, route.controllerMethod);
        }
      }
    }
  }

  if (options.swagger.enabled) {

    if (options.swagger.apiDocsDir) {
      server.get(/\/api-docs\/?.*/, restify.serveStatic({
        directory: options.swagger.apiDocsDir,
        default: 'resources.json'
      }));
    }

    server.get(/\/swagger\/?.*/, restify.serveStatic({
      directory: __dirname + '/public/',
      default: 'index.html'
    }));
  }

  var port = process.env.PORT || options.port || 3000;

  server.listen(port, function () {
    logger.info('%s listening at %s', server.name, server.url);
    return callback(null, port)
  });

};

module.exports = exports;
