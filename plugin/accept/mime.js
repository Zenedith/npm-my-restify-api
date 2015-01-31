var path = require('path');
var mime = require('mime');
mime.load(path.join(__dirname, 'types/mime.types'));

module.exports = mime;