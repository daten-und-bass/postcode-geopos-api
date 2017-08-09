'use strict';

var volos = require('volos-swagger');
var _ = require('lodash');
var path = require('path');
var pgaOAuthOptions = require('../../../config/context/').db.config.auth.oAuth.volos.options;

module.exports = function create(fittingDef, bagpipes) {

  bagpipes.config.swaggerNodeRunner.swagger['x-volos-resources'].oauth2.options.encryptionKey = pgaOAuthOptions.encryptionKey;
  bagpipes.config.swaggerNodeRunner.swagger['x-volos-resources'].oauth2.options.host = pgaOAuthOptions.host;
  bagpipes.config.swaggerNodeRunner.swagger['x-volos-resources'].oauth2.options.port = pgaOAuthOptions.port;
  bagpipes.config.swaggerNodeRunner.swagger['x-volos-resources'].oauth2.options.db = pgaOAuthOptions.db;
  bagpipes.config.swaggerNodeRunner.swagger['x-volos-resources'].oauth2.options.options = {};
  bagpipes.config.swaggerNodeRunner.swagger['x-volos-resources'].oauth2.options.options.auth_pass = pgaOAuthOptions.options.auth_pass;
  
  var swaggerNodeRunner = bagpipes.config.swaggerNodeRunner;

  var appRoot = swaggerNodeRunner.config.swagger.appRoot;
  fittingDef.helpers = path.resolve(appRoot, fittingDef.helpers || 'api/helpers');

  var middleware = volos.auth(swaggerNodeRunner.swagger, fittingDef);

  // install security handlers (won't overwrite existing ones)
  if (middleware.swaggerSecurityHandlers) {
    swaggerNodeRunner.swaggerSecurityHandlers = swaggerNodeRunner.swaggerSecurityHandlers || {};
    _.defaults(swaggerNodeRunner.swaggerSecurityHandlers, middleware.swaggerSecurityHandlers);

    function swaggerRouterDetector(ea) { return ea.name === 'swagger_router' }

    var swaggerRouterDef = _.find(swaggerNodeRunner.config.swagger.bagpipes, swaggerRouterDetector);
    swaggerRouterDef.controllersDirs.push(middleware.controllers);
  }

  return function volos_auth(context, cb) {
    middleware(context.request, context.response, cb);
  }
};
