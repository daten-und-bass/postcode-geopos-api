'use strict';

var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: 'filelog-info.log',
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'warn-file',
      filename: 'filelog-warn.log',
      level: 'warn'
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: 'filelog-error.log',
      level: 'error'
    })
  ]
});

var logging = {
  postcodes: {
    load: {
      counter: {
        error: 0,
        warn: 0,
        info: 0,
      },

      writer: function (error, data) { 

        switch (data.action){

          case 'pcReq':
          case 'pcReq200':
          case 'pcReqNot200':
          case 'pcReq200Empty':
            if (error) { 
              logging.postcodes.load.counter.error =  logging.postcodes.load.counter.error + 1; 
              data.counters = logging.postcodes.load.counter; 
              logger.log('error', data.action + ': Caught excesption ... no namesAdd executed', data);
              logging.postcodes.load.counter.error =  logging.postcodes.load.counter.error + 1; 
              data.counters = logging.postcodes.load.counter; 
              logger.log('error', data.action + ': Caught excesption ... no positionsAdd executed', data);
              logging.postcodes.load.counter.error =  logging.postcodes.load.counter.error + 1; 
              data.counters = logging.postcodes.load.counter; 
              logger.log('error', data.action + ': Caught excesption ... no objectsAdd executed', data);
            } else { 
              logging.postcodes.load.counter.warn =  logging.postcodes.load.counter.warn + 1;
              data.counters = logging.postcodes.load.counter;
              logger.log('warn', data.action + ': Nothing found ... no namesAdd executed', data);
              logging.postcodes.load.counter.warn =  logging.postcodes.load.counter.warn + 1;
              data.counters = logging.postcodes.load.counter;
              logger.log('warn', data.action + ': Nothing found ... no positionsAdd executed', data); 
              logging.postcodes.load.counter.warn =  logging.postcodes.load.counter.warn + 1;
              data.counters = logging.postcodes.load.counter;
              logger.log('warn', data.action + ': Nothing found ... no objectsAdd executed', data); 
            } 
            break;

          case 'namesAdd':
          case 'positionsAdd':
            if (error) { 
              logging.postcodes.load.counter.error =  logging.postcodes.load.counter.error + 1;
              data.counters = logging.postcodes.load.counter;
              logger.log('error', data.action + ': Caught excesption', data);
            } else {

              if (data.response === 1) { 
                logging.postcodes.load.counter.info =  logging.postcodes.load.counter.info + 1;
                data.counters = logging.postcodes.load.counter;
                logger.log('info', 'Success', data); 
              } else {
                logging.postcodes.load.counter.warn =  logging.postcodes.load.counter.warn + 1;
                data.counters = logging.postcodes.load.counter;
                logger.log('warn', 'Wrong response', data); 
              }
            }
            break;

          case 'objectsAdd':
            if (error) { 
              logging.postcodes.load.counter.error =  logging.postcodes.load.counter.error + 1;
              data.counters = logging.postcodes.load.counter;
              logger.log('error', data.action + ': Caught excesption', data);
            } else {

              if (data.response === 'OK') { 
                logging.postcodes.load.counter.info =  logging.postcodes.load.counter.info + 1;
                data.counters = logging.postcodes.load.counter;
                logger.log('info', 'Success', data); 
              } else { 
                logging.postcodes.load.counter.warn =  logging.postcodes.load.counter.warn + 1;
                data.counters = logging.postcodes.load.counter;
                logger.log('warn', 'Wrong response', data); 
              } 
            }
            break;

          default:
            if (error) { 
              logging.postcodes.load.counter.error =  logging.postcodes.load.counter.error + 1; 
              data.counters = logging.postcodes.load.counter; 
              logger.log('error', 'Caught excesption', data); 
            }
            else { 
              logging.postcodes.load.counter.error =  logging.postcodes.load.counter.error + 1;
              data.counters = this.counter; 
              logger.log('warn', 'Unknown, uncaught Event',data); 
            } 
        }
      },

      reader: function (file, fields, line, callback) {
        
        var options = {
          from: new Date(2000, 1, 1),
          until: new Date(),
          limit: 10,
          start: 0,
          order: 'desc',
          fields: fields
        };

        logger.query(options, function (error, results) {
          
          if (error) {
            return callback(error, null);
          }
          // console.log(results[file]);
          if (results[file].length > 0) {

            return callback(null, results[file][line].counters);
          } else {

            return callback(null, logging.postcodes.load.counter);
          }
          
        });
      },
      
      utils: {
        dataMaker: function (error, action, response, postcode, index) {

          return {error, action, response, postcode, index};
        },
      },
    },
  },
};

module.exports = logging;


