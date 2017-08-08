var environment = function() {
  return process.env.NODE_ENV || 'development';
};

var appConfig = require('./config_' + environment());

module.exports = appConfig;
