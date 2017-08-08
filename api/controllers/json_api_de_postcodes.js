'use strict';

var request = require('request');

var utilLogger = function (error, response, member) {
  console.warn("---------------------------------------+++++++++");
  console.warn("member: " + member);
  console.warn("response: " + response);
  console.warn("error: " + error);
  console.warn("---------------------------------------+++++++++");

  // if (error) { return next(error); }

  // return next(response);
};

var jsonApiDePostcodes = function (api) {

  var that = this;

  var pcNamesZKey = api.parameters.de.name + ":" + api.parameters.postcodes.name + ":names";
  var pcPositionsZKey = api.parameters.de.name + ":" + api.parameters.postcodes.name + ":positions";
  var pcObjectsHPrefix = api.parameters.de.name + ":" + api.parameters.postcodes.name+ ":object";

  var pcNamesZScore = 0;

  return {
    load: function (req, res) {
      // [{"osm_city_id":"2803631","city":"Allmendingen","postcode":"89604","district":"Alb-Donau-Kreis","state":"Baden-Wuerttemberg"},
      //  {"osm_city_id":"62422","city":"Berlin","postcode":"10247","district":"","state":"Berlin"}, ...]
      var postcodes = [];
      var successCounter = 0;
      var nonSuccessCounter = 0;
      var postcodesNoSuccess = [];
      var foundIt = false;

      postcodes.forEach(function (postcode, index) {

        request(process.env.DNB_ENV_APP_S1_WB_REQUEST_BASE_URL + postcode.state + '/' + postcode.postcode + process.env.DNB_ENV_APP_S1_WB_REQUEST_QUERY_PARAMS, function (error, response, body) {

          if (!error && response.statusCode == 200) {

            JSON.parse(body).forEach(function (entry, bodyIndex) {

              if(entry.osm_type === "relation" && entry.type === "postcode") {
                
                successCounter = successCounter + 1;
                foundIt = true;
                console.log("PLZ: " + postcode.postcode + " Counter: " + successCounter);
                
                var pcNamesZMember = "";
                var pcObjectsHValueBBX = entry.boundingbox.join();

                if(postcode.district === "") {

                  pcNamesZMember = postcode.postcode + " " + postcode.city + " " + entry.display_name.split(",")[0];

                  
                  that.db.postcodes.names.add(pcNamesZKey, [pcNamesZScore, pcNamesZMember], utilLogger);
                  that.db.postcodes.positions.add(pcPositionsZKey, [entry.lon, entry.lat, postcode.postcode], utilLogger);

                  delete entry.boundingbox;
                  entry.boundingbox = pcObjectsHValueBBX;
                  that.db.postcodes.objects.add(pcObjectsHPrefix + ":" + postcode.postcode, entry, utilLogger);

                  console.log("Succes Empty district");
                } else {

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

                  that.db.postcodes.names.add(pcNamesZKey, [pcNamesZScore, pcNamesZMember], utilLogger);
                  that.db.postcodes.positions.add(pcPositionsZKey, [entry.lon, entry.lat, postcode.postcode], utilLogger);

                  delete entry.boundingbox;
                  entry.boundingbox = pcObjectsHValueBBX;
                  that.db.postcodes.objects.add(pcObjectsHPrefix + ":" + postcode.postcode, entry, utilLogger);

                  console.log("Succes district");
                }
              }

              if(JSON.parse(body).length -1 === bodyIndex && foundIt === false) {
                nonSuccessCounter++;
                console.log("PLZ: " + postcode.postcode + " nonSuccessCounter: " + nonSuccessCounter);
                console.log(entry);
                foundIt = false;
                console.log("--------------------------------------------");  
              }

            });
          } else {
            postcodesNoSuccess.push(postcodes[index]);
            console.log("-----------------------------!!!!!!!");
            console.log("PLZ: " + postcode.postcode + " Counter: " + successCounter);
            console.log("PC Length: " + postcodesNoSuccess.length);
            console.log("Index: " + index);
            console.warn("error: " + error);
            console.log("-----------------------------!!!!!!!");
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




