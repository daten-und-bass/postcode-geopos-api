'use strict';

var request = require('request');

var jsonApiDePostcodes = function (api) {

  var that = this;

  var pcNamesZKey = api.parameters.de.name + ":" + api.parameters.postcodes.name + ":names";
  var pcPositionsZKey = api.parameters.de.name + ":" + api.parameters.postcodes.name + ":positions";
  var pcObjectsHPrefix = api.parameters.de.name + ":" + api.parameters.postcodes.name+ ":object";

  var pcNamesZScore = 0;

  return {
    load: function (req, res, next) {
      // [{"osm_city_id":"2803631","city":"Allmendingen","postcode":"89604","district":"Alb-Donau-Kreis","state":"Baden-Wuerttemberg"},
      //  {"osm_city_id":"62422","city":"Berlin","postcode":"10247","district":"","state":"Berlin"}, ...]
      var pc = [{"osm_city_id":"1075132","city":"Bereborn","postcode":"56769","district":"Landkreis Vulkaneifel","state":"Rheinland-Pfalz"},
{"osm_city_id":"1075158","city":"Berenbach","postcode":"56766","district":"Landkreis Vulkaneifel","state":"Rheinland-Pfalz"},
{"osm_city_id":"540444","city":"Berg","postcode":"56357","district":"Rhein-Lahn-Kreis","state":"Rheinland-Pfalz"},
{"osm_city_id":"932489","city":"Berg","postcode":"82335","district":"Landkreis Starnberg","state":"Bayern"},
{"osm_city_id":"1021686","city":"Berg","postcode":"95180","district":"Landkreis Hof","state":"Bayern"}];
      var pcReqIsSuccess = false;
      var pcReqNoSuccess = [];

      that.logger.counter.error = 0;
      that.logger.counter.warn = 0;
      that.logger.counter.info = 0;

      pc.forEach(function (postcode, index) {

        var pcReqUrl = process.env.DNB_ENV_APP_S1_WB_REQUEST_BASE_URL + postcode.state + '/' + postcode.postcode + process.env.DNB_ENV_APP_S1_WB_REQUEST_QUERY_PARAMS;

        request(pcReqUrl, function (error, response, body) {

          if (error) {

            var logData = that.logger.utils.dataMaker(error, 'pcReq', null, postcode.postcode + " " + postcode.city );
            that.logger.writer(logData);
            pcReqNoSuccess.push(pc[index]);

          }
          if (!error && response.statusCode == 200) {

            JSON.parse(body).forEach(function (entry, bodyIndex) {

              if(entry.osm_type === "relation" && entry.type === "postcode") {
                
                pcReqIsSuccess = true;
                
                var pcNamesZMember = "";
                var pcObjectsHValueBBX = entry.boundingbox.join();

                if(postcode.district === "") {

                  pcNamesZMember = postcode.postcode + " " + postcode.city + " " + entry.display_name.split(",")[0];

                  that.db.postcodes.names.add(pcNamesZKey, [pcNamesZScore, pcNamesZMember], that.logger.writer);
                  that.db.postcodes.positions.add(pcPositionsZKey, [entry.lon, entry.lat, postcode.postcode], that.logger.writer);

                  delete entry.boundingbox;
                  entry.boundingbox = pcObjectsHValueBBX;
                  that.db.postcodes.objects.add(pcObjectsHPrefix + ":" + postcode.postcode, entry, that.logger.writer);

                } 
                else {

                  pcNamesZMember = postcode.postcode + " " + entry.display_name.split(",")[0];
                    
                  if(entry.display_name.split(",")[0].indexOf(postcode.city) === -1 && entry.display_name.split(",")[1].indexOf(postcode.city) === -1) {
                    
                    pcNamesZMember = pcNamesZMember.concat(" ", postcode.city);
                  }
                  // replaced umlauts in thueringen und wuerttemberg
                  // added quotation marks for OSM_id and postcode
                  // removed Städteregion Aachen in district where city is Aachen
                  if(entry.display_name.split(",")[1].indexOf("Landkreis") === -1 && entry.display_name.split(",")[1].indexOf("Verbandsgemeinde") === -1 &&
                     entry.display_name.split(",")[1].indexOf("VGem") === -1 && entry.display_name.split(",")[1].indexOf("Kreis") === -1 &&
                     entry.display_name.split(",")[1].indexOf("Amt") === -1 && entry.display_name.split(",")[1].indexOf("Samtgemeinde") === -1 &&
                     entry.display_name.split(",")[1].indexOf("-Land") === -1 && entry.display_name.split(",")[1].indexOf("Verwaltungsverband") === -1 && 
                     entry.display_name.split(",")[1].indexOf("Verwaltungsgemeinschaft") === -1 && entry.display_name.split(",")[1].indexOf("GVV") === -1 &&
                     entry.display_name.split(",")[1].indexOf("Region") === -1 && entry.display_name.split(",")[1].indexOf("Gemeindeverwaltungsverband") === -1 &&
                     pcNamesZMember.indexOf(entry.display_name.split(",")[1]) === -1) { 

                    pcNamesZMember = pcNamesZMember.concat(entry.display_name.split(",")[1]);
                  }

                  that.db.postcodes.names.add(pcNamesZKey, [pcNamesZScore, pcNamesZMember], that.logger.writer);
                  that.db.postcodes.positions.add(pcPositionsZKey, [entry.lon, entry.lat, postcode.postcode], that.logger.writer);

                  delete entry.boundingbox;
                  entry.boundingbox = pcObjectsHValueBBX;
                  that.db.postcodes.objects.add(pcObjectsHPrefix + ":" + postcode.postcode, entry, that.logger.writer);

                }
              }

              if(JSON.parse(body).length -1 === bodyIndex && pcReqIsSuccess === false) {

                var logData = that.logger.utils.dataMaker(null, 'pcReq200', response.statusCode, postcode.postcode + " " + postcode.city );
                that.logger.writer(logData);
                pcReqNoSuccess.push(pc[index]);
              }
            });
          } else {
            var logData = that.logger.utils.dataMaker(null, 'pcReqNot200', response.statusCode, postcode.postcode + " " + postcode.city );
            that.logger.writer(logData);
            pcReqNoSuccess.push(pc[index]);
          }
        });
      });

      res.send(["Started"]);
    },

    namesRange: function (req, res, next) {

      var pcNamesZRangeMin = "[" + req.swagger.params.leadRegion.value;
      var pcNamesZRangeMax = "[" + req.swagger.params.leadRegion.value + "\xff";

      that.db.postcodes.names.range(pcNamesZKey, pcNamesZRangeMin, pcNamesZRangeMax, function(error, response) {

        if (error) { return next(error); }

        res.send(response);   
      });
    },

    positionsGet: function (req, res, next) {

      var pcPositionsZMember = req.swagger.params.postcode.value;

      that.db.postcodes.positions.get(pcPositionsZKey, pcPositionsZMember, function (error, response) {
        
        if (error) { return next(error); }

        res.send(response);

      });
    },

    objectsGet: function (req, res, next) {

      var pcObjectsHKey = req.swagger.params.de.value + ":" + req.swagger.params.postcodes.value + ":object:" + req.swagger.params.postcode.value;

      that.db.postcodes.objects.get(pcObjectsHKey, function (error, response) {
        
        if (error) { return next(error); }

        res.send(response);
      });
    },
  };
};

module.exports = jsonApiDePostcodes;




