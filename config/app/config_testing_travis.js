'use strict';

var fs = require('fs');

var appConfig = {
  environment: function() {
    var environment = {
      name: process.env.NODE_ENV,
    };

    return environment;
  },

  web: function() {
    var web = {
      https: {
        port: process.env.DNB_N_NODEJS_OAI_HTTPS_PORT,
        crt: process.env.HOME + '/' + process.env.DNB_ENV_APP_S1_WB_FTED_HTTPS_CERT1_PUB,
        key: process.env.HOME + '/' + process.env.DNB_ENV_APP_S1_WB_FTED_HTTPS_CERT1_KEY,
      },
      // proxies: [ process.env.x1, process.env.x2 ],
    };

    return web;
  },

  db: function() {
    var db = {
      store: {
        host: process.env.DNB_ENV_APP_S2_DB,
        port: process.env.DNB_N_REDIS_PORT,
        options: {
          db: parseInt(process.env.DNB_APP_S2_DB_INST1),
          auth_pass: process.env.DNB_ENV_APP_S2_DB_PASS,
          // prefix: 'pga:posctcodes:',
        },
      },
    };

    return db;
  },

  dbAuth: function() {
    var dbAuth = {
      store: {
        host: process.env.DNB_ENV_APP_S2_DB,
        port: process.env.DNB_N_REDIS_PORT,
        options: {
          auth_pass: process.env.DNB_ENV_APP_S2_DB_PASS,
        },
      },
      
      auth: {
        oAuth: {
          type: 'oAuth',
          volos: {
            type: 'volos',
            options: {
              encryptionKey: process.env.DNB_ENV_APP_S1_WB_OAUT_SEC,
              db: parseInt(process.env.DNB_APP_S2_DB_INST0),
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
  process.env.PGA_WEB_HTTPS_CRT = fs.readFileSync(appConfig.web().https.crt, 'utf8');
})();

module.exports = appConfig;
