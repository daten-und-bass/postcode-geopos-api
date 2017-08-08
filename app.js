'use strict';

var express = require('express');
var path = require('path');
var https = require('https');

var helmet = require('helmet');
var forceSSL = require('express-force-ssl');

var webConfig = require('./config/context').webConfig;

var SwaggerExpress = require('swagger-express-mw');
var SwaggerUi = require('swagger-tools/middleware/swagger-ui');

var app = express();

var httpsServer = https.createServer({key: process.env.PGA_WEB_HTTPS_KEY, cert: process.env.PGA_WEB_HTTPS_CRT}, app);
httpsServer.listen(webConfig.https.port);

app.set("forceSSLOptions", { httpsPort: webConfig.https.port });

app.use(helmet());
app.use(forceSSL);


var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  app.use(SwaggerUi(swaggerExpress.runner.swagger));

  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/api/v1/']) {
    console.log('Project started.');
  }
});

module.exports = app; 
