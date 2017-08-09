'use strict';

var api = require('yamljs').load('api/swagger/swagger.yaml');

var webConfig = require('../app').web();
var dbConfig = require('../app').db();

var dbContext = {
  dbConfig: dbConfig,
}

var db = require('../../data/db/db')
               .call(dbContext);

var context = {
  index: {
    db: db,
  },
};

var context_json_api_de_postcodes = require('../../api/controllers/json_api_de_postcodes')
                               .call(context.index, api);

module.exports = {
  webConfig: webConfig,
  db: db,
  context_json_api_de_postcodes: context_json_api_de_postcodes,
};

