'use strict';

const fs = require('fs');
const myRestifyApi = require('../index');
const logger = require('../lib/logger/logger').logger;

const startServer = function startServer(callback) {
  fs.readFile('config/public.key', (err, data) => {
    if (err) {
      logger.debug('config/public.key read error: ', err);
      throw err;
    }

    const options = {
      appName: 'API',
      bodyParser: {
        enabled: true,
        options: {
          maxBodySize: 1e6,
          mapParams: true,
          overrideParams: false
        }
      },
      acceptable: [
        'application/vnd.example.com.v1+json',
        'application/vnd.example.com.v1+xml'
      ]
    };

    const errorHandlers = {
      ExampleNotFound: {
        className: 'NotFoundError'
      },
      ServiceUnavailable: {
        className: 'ServiceUnavailableError'
      },
      '': {
        className: 'ServiceUnavailableError'
      }
    };

    const publicCacheHandler = function publicCacheHandler(req, res, next) {
      res.cache('public', {maxAge: 600});
      res.header('Vary', 'Accept-Language, Accept-Encoding, Accept, Content-Type');
      return next();
    };

    const noPreconditionHandler = function noPreconditionHandler(req, res, next) {
      return next();
    };

    const noAuth = function noAuth(req, res, next) {
      return next();
    };

    const routes = {
      get: [],
      post: [],
      put: [],
      del: []
    };

    routes.get.push({
      options: {
        path: '/api/examples', version: '1.0.0'
      },
      cache: publicCacheHandler,
      precondition: noPreconditionHandler,
      authMethod: noAuth,
      controllerMethod: function (request, options, callback) {
        return callback(null, 'result');
      }
    });

    routes.post.push({
      options: {
        path: '/api/examples', version: '1.0.0'
      },
      cache: publicCacheHandler,
      precondition: noPreconditionHandler,
      authMethod: noAuth,
      controllerMethod: function (request, options, callback) {
        return callback(null, 'result');
      }
    });

    routes.put.push({
      options: {
        path: '/api/examples/:id', version: '1.0.0'
      },
      cache: publicCacheHandler,
      precondition: noPreconditionHandler,
      authMethod: noAuth,
      controllerMethod: function (request, options, callback) {
        return callback(null, 'result');
      }
    });

    routes.del.push({
      options: {
        path: '/api/examples/:id', version: '1.0.0'
      },
      cache: publicCacheHandler,
      precondition: noPreconditionHandler,
      authMethod: noAuth,
      controllerMethod: function (request, options, callback) {
        return callback(null, 'result');
      }
    });

    const server = myRestifyApi.createServer(routes, errorHandlers, options);

    server.opts(/.*/, (req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', req.header('Access-Control-Request-Method'));
      res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers'));
      res.send(200);
      return next();
    });

    myRestifyApi.runServer(server, options, (serverErr, port) => {
      logger.debug('myRestifyApi running on port: %d', port);
      return callback(serverErr, port);
    });

  });
};

module.exports = {
  startServer: startServer
};