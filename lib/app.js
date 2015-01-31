var restify = require('restify');
var logger = require('./logger/logger').logger;
var acceptParser = require('./plugin/accept/acceptParser').acceptParser;
var formatXml = require('./plugin/formatter/xml').formatXml;
var cors = require('./plugin/cors').cors;

exports.runServer = function (routesMethods, options, callback) {

  routesMethods = routesMethods || {};
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

  server.acceptable.push('application/vnd.vehicle-history.v1+json');
  server.acceptable.push('application/vnd.vehicle-history.v1+xml');

  server.pre(acceptParser(server.acceptable));
  server.pre(restify.pre.userAgentConnection());  //curl fix
  server.pre(restify.pre.sanitizePath());
  server.use(cors());


//server.use(restify.authorizationParser());
//server.use(restify.dateParser());
  server.use(restify.queryParser());
//server.use(restify.urlEncodedBodyParser());


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
