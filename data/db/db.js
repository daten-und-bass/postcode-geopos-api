'use strict';

var debug = require('debug')('redis');
var redis = require('redis');

var db = function() {

  var that = this;

  var redisClient = redis.createClient(that.dbConfig.store.port, that.dbConfig.store.host, that.dbConfig.store.options);
  
  redisClient.on('connect', function() {
    redisClient.select(parseInt(that.dbConfig.store.options.db));
  });

  redisClient.on('error', function (error) {
      console.log('Error ' + error);
  });

  return {
    config: that.dbConfig,

    postcodes: { // interface always?: key, params, options, callback
      names: {
        add: function (key, memberData, callback) {

          redisClient.zadd(key, memberData, function (error, response) {

            var logData = that.logger.utils.dataMaker(error, 'namesAdd', response, memberData);
            
            if (error) { return callback(error, logData); }

            if (response === 1) {
              return callback(null, logData);
            } else {
              return callback(null, logData);
            }
          });
        },
        range: function (key, min, max, callback) {

          debug('pga:key', key);
          debug('pga:range', min);
          debug('pga:max', max);
          debug('pga:callback', callback);
          redisClient.ZRANGEBYLEX(key, min, max, function (error, response) {
            
            if (error) { return callback(error); }

            if (response.length !== 0) {
              return callback(null, response);
            } else {
              return callback(null, []);
            }
          });
        },
      },
      
      positions: {
        add: function (key, memberData, callback) {

          redisClient.geoadd(key, memberData, function (error, response) {

            var logData = that.logger.utils.dataMaker(error, 'positionsAdd', response, memberData);
            
            if (error) { return callback(error, logData); }

            if (response === 1) {
              return callback(null, logData);
            } else {
              return callback(null, logData);
            }
          });
        },
        get: function (key, member, callback) {

          redisClient.GEOPOS(key, member, function(error, response) {

            if (error) { return callback(error); }

            if (response[0] !== null) {
              return callback(null, response[0]);
            } else {
              return callback(null, []);
            }
          }); 
        },
      },
      objects: {
        add: function (key, postcodeObject, callback) {

          redisClient.hmset(key, postcodeObject, function (error, response) {

            var logData = that.logger.utils.dataMaker(error, 'objectsAdd', response, postcodeObject.display_name);
            
            if (error) { return callback(error, logData); }

            if (response === "OK") {
              return callback(null, logData);
            } else {
              return callback(null, logData);
            }
          });
        },
        get: function (key, callback) {
          
          redisClient.hgetall(key, function (error, response) {
            
            if (error) { return callback(error); }

            if (response !== null) {
              return callback(null, response);
            } else {
              return callback(null, {});
            }
          });
        }
      },
    },
  };
};

module.exports = db;






