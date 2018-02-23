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

    postcodes: {
      names: {    
        add: function (key, args, options, callback) {

          redisClient.zadd(key, args, function (error, response) {

            var logData = that.logger.utils.dataMaker(error, 'namesAdd', response, options.postcode, options.index);
            
            // if (error) { return callback(error, response); }

            return callback(error, logData);
          });
        },

        range: function (key, args, options, callback) {

          debug('pga:key', key);
          debug('pga:min', args[0]);
          debug('pga:max', args[1]);
          debug('pga:callback', callback);
          redisClient.ZRANGEBYLEX(key, args[0], args[1], function (error, response) {
            
            if (error) { return callback(error, null); }

            if (response.length !== 0) {
              return callback(null, response);
            } else {
              return callback(null, []);
            }
          });
        },

        scan: function (key, args, options, callback) {

          redisClient.ZSCAN(key, args, function (error, response) {
            
            if (error) { return callback(error, null); }

            if (response.length !== 0) {
              return callback(null, response[1].filter(function (element) {
                return element !== "0";
              }));
            } else {
              return callback(null, []);
            }
          });
        },
      },

      positions: {
        add: function (key, args, options, callback) {

          redisClient.geoadd(key, args, function (error, response) {

            var logData = that.logger.utils.dataMaker(error, 'positionsAdd', response, options.postcode, options.index);
            
            // if (error) { return callback(error, logData); }

            return callback(error, logData);
          });
        },

        get: function (key, args, options, callback) {

          redisClient.GEOPOS(key, args[0], function(error, response) {

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
        add: function (key, args, options, callback) {


          redisClient.hmset(key, args[0], function (error, response) {

            var logData = that.logger.utils.dataMaker(error, 'objectsAdd', response, options.postcode, options.index);
            
            // if (error) { return callback(error, logData); }

            return callback(error, logData);
          });
        },

        get: function (key, args, options, callback) {
          
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

      distance: {
        get: function (key, args, options, callback) {

          redisClient.GEODIST(key, args, function(error, response) {

            if (error) { return callback(error); }

            if (response !== null) {
              return callback(null, [response, args[2]]);
            } else {
              return callback(null, []);
            }
          }); 
        },
      },
    },
  };
};

module.exports = db;






