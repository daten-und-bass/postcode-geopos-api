'use strict';

var api = require('yamljs').load('api/swagger/swagger.yaml');

var webConfig = require('../app').web();
var dbConfig = require('../app').db();
var dbAuthConfig = require('../app').dbAuth();

var logger = require('../../api/helpers/logger.js')

var dbContext = {
  dbConfig: dbConfig,
  logger: logger.postcodes.load,
}

var db = require('../../data/db/db')
          .call(dbContext);

var context = {
  index: {
  },
  postcodes: {
    db: db.postcodes,
    logger: logger.postcodes.load
  }
};

var context_json_api_de_postcodes = require('../../api/controllers/json_api_de_postcodes')
                                      .call(context.postcodes, api);

module.exports = {
  webConfig: webConfig,
  dbAuthConfig: dbAuthConfig,
  context_json_api_de_postcodes: context_json_api_de_postcodes,
};

