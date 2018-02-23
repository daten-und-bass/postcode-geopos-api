'use strict';

var request = require('request');
// var postcodes = require('../../public/data/import_base_file/postcodes');
var postcodes =[{"osm_city_id":"2803631","city":"Allmendingen","postcode":"89604","district":"Alb-Donau-Kreis","state":"Baden-Wuerttemberg"},
                {"osm_city_id":"62422","city":"Berlin","postcode":"10247","district":"","state":"Berlin"}]

var jsonApiDePostcodes = function (api) {

  var that = this;

  var pcNamesZKey = api.parameters.de.name + ":" + api.parameters.postcodes.name + ":names";
  var pcPositionsZKey = api.parameters.de.name + ":" + api.parameters.postcodes.name + ":positions";
  var pcObjectsHPrefix = api.parameters.de.name + ":" + api.parameters.postcodes.name + ":object";

  var pcNamesZScore = 0;

  return {
    load: function (req, res, next) {

      that.logger.reader('info-file', ['counters', 'timestamp'], 0, function (error, infoFileCounters) {

        console.log(infoFileCounters);
        that.logger.counter.error = infoFileCounters.error || 0;
        that.logger.counter.warn = infoFileCounters.warn || 0;
        that.logger.counter.info = infoFileCounters.info || 0;

        var indexInLogs = (infoFileCounters.error + infoFileCounters.warn + infoFileCounters.info) / 3;
        var amountNext = 50;
        var pc = postcodes.slice(indexInLogs, indexInLogs + amountNext)
        console.log(indexInLogs);
        console.log(indexInLogs + amountNext);
        console.log(pc.length);
        console.log(postcodes[indexInLogs])
        console.log(pc[0])
        console.log(postcodes[indexInLogs + amountNext - 1])
        console.log(pc[49])
        // console.log(pc);

        pc.forEach(function (postcode, index) {

          var pcReqIsSuccess = false;
          var pcReqUrl = process.env.DNB_ENV_APP_S1_WB_REQUEST_BASE_URL + postcode.state + '/' + postcode.postcode + process.env.DNB_ENV_APP_S1_WB_REQUEST_QUERY_PARAMS;
          
          var pcNamesZMember = "";
          var pcObjectsHKey  = "";
          var pcObjectsHValueBBX = "";
          
          var logData = {};

          request(pcReqUrl, function (error, response, body) {

            if (error) {

              logData = that.logger.utils.dataMaker(error, 'pcReq', null, postcode, index);
              that.logger.writer(error, logData);
            }

            if (!error && response.statusCode == 200) {
              
              if (JSON.parse(body).length === 0 ) {
                logData = that.logger.utils.dataMaker(null, 'pcReq200Empty', response.statusCode, postcode, index);
                that.logger.writer(null, logData); 
              }

              JSON.parse(body).forEach(function (entry, bodyIndex) {

                if(entry.osm_type === "relation" && entry.type === "postcode" && pcReqIsSuccess === false) {
                  
                  pcReqIsSuccess = true;

                  pcObjectsHKey = pcObjectsHPrefix + ":" + postcode.postcode;
                  pcObjectsHValueBBX = entry.boundingbox.join();
                  delete entry.boundingbox;
                  entry.boundingbox = pcObjectsHValueBBX;

                  if(postcode.district === "") {

                    pcNamesZMember = postcode.postcode + " " + postcode.city + " " + entry.display_name.split(",")[0];
                    
                  } else {

                    pcNamesZMember = postcode.postcode + " " + entry.display_name.split(",")[0];
                      
                    if(entry.display_name.split(",")[0].indexOf(postcode.city) === -1 && entry.display_name.split(",")[1].indexOf(postcode.city) === -1) {
                      
                      pcNamesZMember = pcNamesZMember.concat(" ", postcode.city);
                    }

                    if(entry.display_name.split(",")[1].indexOf("Landkreis") === -1 && entry.display_name.split(",")[1].indexOf("Verbandsgemeinde") === -1 &&
                       entry.display_name.split(",")[1].indexOf("VGem") === -1 && entry.display_name.split(",")[1].indexOf("Kreis") === -1 &&
                       entry.display_name.split(",")[1].indexOf("Amt") === -1 && entry.display_name.split(",")[1].indexOf("Samtgemeinde") === -1 &&
                       entry.display_name.split(",")[1].indexOf("-Land") === -1 && entry.display_name.split(",")[1].indexOf("Verwaltungsverband") === -1 && 
                       entry.display_name.split(",")[1].indexOf("Verwaltungsgemeinschaft") === -1 && entry.display_name.split(",")[1].indexOf("GVV") === -1 &&
                       entry.display_name.split(",")[1].indexOf("Region") === -1 && entry.display_name.split(",")[1].indexOf("Gemeindeverwaltungsverband") === -1 &&
                       pcNamesZMember.indexOf(entry.display_name.split(",")[1]) === -1) { 

                       pcNamesZMember = pcNamesZMember.concat(entry.display_name.split(",")[1]);
                    }
                  }

                  that.db.names.add(pcNamesZKey, [pcNamesZScore, pcNamesZMember], {postcode, index}, that.logger.writer);
                  that.db.positions.add(pcPositionsZKey, [entry.lon, entry.lat, postcode.postcode], {postcode, index}, that.logger.writer);
                  that.db.objects.add(pcObjectsHKey, [entry], {postcode, index}, that.logger.writer);
                }

                if(JSON.parse(body).length -1 === bodyIndex && pcReqIsSuccess === false) {

                  logData = that.logger.utils.dataMaker(null, 'pcReq200', response.statusCode, postcode, index);
                  that.logger.writer(null, logData);                
                }
              });
            } else {

              logData = that.logger.utils.dataMaker(null, 'pcReqNot200', response.statusCode, postcode, index);
              that.logger.writer(null, logData);
            }
          });
        });
      });

      res.send(["Started"]);
    },

    namesRangeOrScan: function (req, res, next) {

      if (req.swagger.params.leadRegion.value && ! req.swagger.params.namesPattern.value ) {
        
        var pcNamesZRange = []
        pcNamesZRange[0] = "[" + req.swagger.params.leadRegion.value;
        pcNamesZRange[1] = "[" + req.swagger.params.leadRegion.value + "\xff";

        that.db.names.range(pcNamesZKey, pcNamesZRange, {}, function(error, response) {

          if (error) { return next(error); }

          res.send(response);
        });

      } else if (req.swagger.params.namesPattern.value && ! req.swagger.params.leadRegion.value ) {
        
        var pcNamesZCursor = 0;
        var pcNamesZMATCH = "MATCH";
        var pcNamesZPatternString = req.swagger.params.namesPattern.value; 
        var pcNamesZPattern = "*[" + pcNamesZPatternString[0].toLocaleLowerCase() + pcNamesZPatternString[0].toUpperCase() + "]" + pcNamesZPatternString.slice(1).toLowerCase() + "*";
        var pcNamesZCOUNT = "COUNT";
        var pcNamesZAmount = 13000;   // dirty. see: https://github.com/NodeRedis/node_redis/blob/master/examples/scan.js

        that.db.names.scan(pcNamesZKey, [pcNamesZCursor, pcNamesZMATCH, pcNamesZPattern, pcNamesZCOUNT, pcNamesZAmount], {}, function(error, response) {

          if (error) { return next(error); }

          res.send(response);
        });
      }

      else {

        res.status(400).send({
          "message": "Request validation failed: Either parameter (leadRegion) or parameter (namesPattern) are required",
          "code": "REQUIRED",
          "failedValidation": true,
          "path": [
              "paths",
              "/api/v1/{de}/{postcodes}/names",
              "get",
              "parameters",
              [ "2", "3" ]
          ],
          "paramName": ["leadRegion", "namesPattern"]
        });
      }

    },

    positionsGet: function (req, res, next) {

      var pcPositionsZMember = req.swagger.params.postcode.value;

      that.db.positions.get(pcPositionsZKey, [pcPositionsZMember], {}, function (error, response) {
        
        if (error) { return next(error); }

        res.send(response);

      });
    },

    objectsGet: function (req, res, next) {

      var pcObjectsHKey = pcObjectsHPrefix + ":" + req.swagger.params.postcode.value;

      that.db.objects.get(pcObjectsHKey, [], {}, function (error, response) {
        
        if (error) { return next(error); }

        res.send(response);
      });
    },

    distanceGet: function (req, res, next) {

      var start = req.swagger.params.start.value;
      var end = req.swagger.params.end.value;
      var unit = req.swagger.params.unit.value;

      that.db.distance.get(pcPositionsZKey, [start, end, unit], {}, function (error, response) {
        
        if (error) { return next(error); }

        res.send(response);

      });
    },
  };
};

module.exports = jsonApiDePostcodes;


                    




