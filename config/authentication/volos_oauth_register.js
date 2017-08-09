'use strict';

var pgaOAuthOptions = require('../app/').db().auth.oAuth.volos.options;

var config = {};

config.devRequest = {
  firstName: 'john',
  lastName: 'doe',
  email: 'email@domain.com',
  userName: 'johnd',
};

config.appRequest = {
  name: 'pga-test',
  scopes: 'write:pc read:pc'
};


var ManagementProvider = require('volos-management-redis');
var options = {
  encryptionKey : pgaOAuthOptions.encryptionKey,
  host: pgaOAuthOptions.host,
  port: pgaOAuthOptions.port,
  db: pgaOAuthOptions.db,
  options: {
    auth_pass: pgaOAuthOptions.options.auth_pass
  }
};

var management = ManagementProvider.create(options);

function createDev(cb) {
  management.createDeveloper(config.devRequest, cb); 
}

function createApp(developer, cb) {
  var appRequest = {
    developerId : developer.id,
    name: config.appRequest.name,
    scopes: config.appRequest.scopes
  };

  management.createApp(appRequest, cb);
}

createDev(function(e, developer) {
  console.log("THE DEVELOPER: " + JSON.stringify(developer) + "\n");
  createApp(developer, function(e, result) {
    console.log("THE APP: " + JSON.stringify(result) + "\n");
    console.log("Client ID: " + result.credentials[0].key + "\n");
    console.log("Client Secret: " + result.credentials[0].secret + "\n");
    var key = encodeURIComponent(result.credentials[0].key);
    var secret = encodeURIComponent(result.credentials[0].secret);
    var scope = encodeURIComponent(config.appRequest.scopes);
    console.log("Obtain access token:  curl -i -X POST http://127.0.0.1:10010/accesstoken -d 'grant_type=client_credentials&client_id=" + key + "&client_secret=" + secret + "&scope=" + scope + "'");
    process.exit();
  });
});

