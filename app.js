require('newrelic');
var restify = require('restify');
var api = require('./controllers/api');
var acceptParser = require('./plugin/accept/acceptParser').acceptParser;
var formatXml = require('./plugin/formatter/xml').formatXml;
var cors = require('./plugin/cors').cors;;

var server = restify.createServer(
  {
    name: 'API',
    formatters: {
      'application/xml': formatXml
    }
  }
);

server.pre(acceptParser(server.acceptable));
server.pre(restify.pre.userAgentConnection());  //curl fix
server.pre(restify.pre.sanitizePath());
server.use(cors());


//server.use(restify.authorizationParser());
//server.use(restify.dateParser());
server.use(restify.queryParser());
//server.use(restify.urlEncodedBodyParser());

var PATH = '/api/vehicle-history';
server.get({path: PATH, version: '1.0.0'}, api.checkVehicleHistoryV1);

//server.get('/api-docs', function (req, res) {
//  res.sendfile('public/api-docs/resources.json');
//  res.contentType = 'json';
//  res.send({hello: 'world'});
//});

//server.get(/\/api-docs\/?.*/, restify.serveStatic({
//  directory: './public/api-docs',
//  default: 'resources.json'
//}));

server.get(/\/swagger\/?.*/, restify.serveStatic({
//server.get('/swagger', restify.serveStatic({
  directory: './public/swagger',
  default: 'index.html'
}));


var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('%s listening at %s', server.name, server.url);
});
