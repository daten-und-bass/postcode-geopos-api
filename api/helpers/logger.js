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
            if (error) { 
              logging.postcodes.load.counter.error =  logging.postcodes.load.counter.error + 1; 
              data.counters = logging.postcodes.load.counter; 
              logger.log('error', 'pcReq: Caught excesption', data); 
            }
            else { 
              logging.postcodes.load.counter.error =  logging.postcodes.load.counter.error + 1;
              data.counters = this.counter; 
              logger.log('error', 'pcReq200 or pcReqNot200: Nothing found', data); 
            } 
          case 'namesAdd':
          case 'positionsAdd':
            if (data.response !== 1) { 
              logging.postcodes.load.counter.warn =  logging.postcodes.load.counter.warn + 1;
              data.counters = logging.postcodes.load.counter;
              logger.log('warn', 'Wrong response', data); 
            } 
            if (data.response === 1) { 
              logging.postcodes.load.counter.info =  logging.postcodes.load.counter.info + 1;
              data.counters = logging.postcodes.load.counter;
              logger.log('info', 'Success', data); 
            }
            break;

          case 'objectsAdd':
            if (data.response !== 'OK') { 
              logging.postcodes.load.counter.warn =  logging.postcodes.load.counter.warn + 1;
              data.counters = logging.postcodes.load.counter;
              logger.log('warn', 'Wrong response', data); 
            } 
            if (data.response === 'OK') { 
              logging.postcodes.load.counter.info =  logging.postcodes.load.counter.info + 1;
              data.counters = logging.postcodes.load.counter;
              logger.log('info', 'Success', data); 
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
              logger.log('error', 'Unknown, uncaught excesption',data); 
            } 
        }
      },
      
      utils: {
        dataMaker: function (error, action, response, member) {
          return {
            error: error,
            action: action,
            response: response,
            member: member,
          };
        },
      },
    },
  },
};

module.exports = logging;


