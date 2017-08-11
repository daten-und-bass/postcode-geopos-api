'use strict';

var fs = require('fs');

var appConfig = {
  environment: function() {
    var environment = {
      name: process.env.NODE_ENV,
    };

    return environment;
  },

  // ENV for URL
  // other configs her or in context
  web: function() {
    var web = {
      https: {
        port: process.env.DNB_N_NODEJS_OAI_HTTPS_PORT,
        crt: process.env.DNB_ENV_V_SEC_PATH + '/' + process.env.DNB_ENV_APP_S1_WB_FTED_HTTPS_CERT1_PUB,
        key: process.env.DNB_ENV_V_SEC_PATH + '/' + process.env.DNB_ENV_APP_S1_WB_FTED_HTTPS_CERT1_KEY,
      },
      // proxies: [ process.env.DNB_INF1_ENV_S1_WF1_FTED_IP1, process.env.DNB_APP_ENV_S1_LB1_FTED_IP1 ],
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
          auth_pass: fs.readFileSync(process.env.DNB_ENV_V_SEC_PATH + '/' + process.env.DNB_ENV_APP_S2_DB_PASS, 'utf8').toString().slice(0, -1),
          // prefix: 'pga:posctcodes:',
        },
      },
    };

    return db;
  },

  dbAuth: function() {
    var dbAuth = {
      store: {
        host: process.env.DNB_ENV_APP_S3_DB,
        port: process.env.DNB_N_REDIS_PORT,
        options: {
          auth_pass: fs.readFileSync(process.env.DNB_ENV_V_SEC_PATH + '/' + process.env.DNB_ENV_APP_S3_DB_PASS, 'utf8').toString().slice(0, -1),
        },
      },
      auth: {
        oAuth: {
          type: 'oAuth',
          volos: {
            type: 'volos',
            options: {
              encryptionKey: fs.readFileSync(process.env.DNB_ENV_V_SEC_PATH + '/' + process.env.DNB_ENV_APP_S1_WB_OAUT_SEC, 'utf8').toString().slice(0, -1),
              db: parseInt(process.env.DNB_APP_S3_DB_INST0),
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
