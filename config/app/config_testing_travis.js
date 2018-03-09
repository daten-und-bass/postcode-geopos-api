'use strict';

var fs = require('fs');

var appConfig = {
  environment: function() {
    var environment = {
      name: process.env.NODE_ENV,
      // git: {
      //   commit: process.env.FLIXNET_WEB_REPO_HEAD,
      // },
    };

    return environment;
  },

  web: function() {
    var web = {
      https: {
        port: process.env.PGA_WEB_HTTPS_PORT,
        pub: process.env.HOME + '/' + process.env.PGA_WEB_HTTPS_PUB_PATH,
        key: process.env.HOME + '/' + process.env.PGA_WEB_HTTPS_KEY_PATH,
      },
      proxies: isNaN(parseInt(process.env.PGA_WEB_PROXIES)) ? false : parseInt(process.env.PGA_WEB_PROXIES),
    };

    return web;
  },

  db: function() {
    var db = {
      store: {
        host: process.env.PGA_DB1,
        port: process.env.PGA_DB1_PORT,
        options: {
          db: parseInt(process.env.PGA_DB1_INST1),
          auth_pass: process.env.PGA_DB1_PASS,
          // prefix: 'pga:posctcodes:',
        },
      },
    };

    return db;
  },

  dbAuth: function() {
    var dbAuth = {
      store: {
        host: process.env.PGA_DB1,
        port: process.env.PGA_DB1_PORT,
        options: {
          auth_pass: process.env.PGA_DB1_PASS,
        },
      },
      
      auth: {
        oAuth: {
          type: 'oAuth',
          options: {
            grant_type: 'client_credentials',
            client_id: process.env.PGA_WEB_API_CLIENT_ID,
            client_secret: process.env.PGA_WEB_API_CLIENT_SECRET,
            scope: "read:pc"
          },
          volos: {
            type: 'volos',
            options: {
              encryptionKey: process.env.PGA_WEB_OAUT_SEC,
              db: parseInt(process.env.PGA_DB1_INST0),
            },
          },
        },
      },
    };

    return dbAuth;
  },

};

(function readPKIFiles() {
  process.env.PGA_WEB_HTTPS_KEY = fs.readFileSync(appConfig.web().https.key, 'utf8');
  process.env.PGA_WEB_HTTPS_PUB = fs.readFileSync(appConfig.web().https.pub, 'utf8');
})();

module.exports = appConfig;
