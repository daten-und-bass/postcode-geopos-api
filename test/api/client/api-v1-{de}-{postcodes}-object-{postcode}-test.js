'use strict';
var chai = require('chai');
var ZSchema = require('z-schema');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var customFormats = module.exports = function(zSchema) {
  // Placeholder file for all custom-formats in known to swagger.json
  // as found on
  // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#dataTypeFormat

  var decimalPattern = /^\d{0,8}.?\d{0,4}[0]+$/;

  /** Validates floating point as decimal / money (i.e: 12345678.123400..) */
  zSchema.registerFormat('double', function(val) {
    return !decimalPattern.test(val.toString());
  });

  /** Validates value is a 32bit integer */
  zSchema.registerFormat('int32', function(val) {
    // the 32bit shift (>>) truncates any bits beyond max of 32
    return Number.isInteger(val) && ((val >> 0) === val);
  });

  zSchema.registerFormat('int64', function(val) {
    return Number.isInteger(val);
  });

  zSchema.registerFormat('float', function(val) {
    // better parsing for custom "float" format
    if (Number.parseFloat(val)) {
      return true;
    } else {
      return false;
    }
  });

  zSchema.registerFormat('date', function(val) {
    // should parse a a date
    return !isNaN(Date.parse(val));
  });

  zSchema.registerFormat('dateTime', function(val) {
    return !isNaN(Date.parse(val));
  });

  zSchema.registerFormat('password', function(val) {
    // should parse as a string
    return typeof val === 'string';
  });
};

customFormats(ZSchema);

var validator = new ZSchema({});
var request = require('request');
var expect = chai.expect;

// require('dotenv').load();

describe('/api/v1/{de}/{postcodes}/object/{postcode}', function() {
  describe('get', function() {
    it('should respond with 200 Success for Content-Type application/json', function(done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "properties": {
          "osm_id": {
            "type": "string"
          },
          "osm_type": {
            "type": "string"
          },
          "place_id": {
            "type": "string"
          },
          "class": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "boundingbox": {
            "type": "string"
          },
          "lat": {
            "type": "string"
          },
          "lon": {
            "type": "string"
          },
          "display_name": {
            "type": "string"
          },
          "importance": {
            "type": "string"
          },
          "licence": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'https://localhost:10011/api/v1/de/postcodes/object/66482',
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.OAUTH_2
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(200);

        expect(body.osm_type).to.equal('relation');
        expect(body.class).to.equal('place');
        expect(body.licence).to.equal('Data © OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright');
        expect(body.importance).to.equal('0.635');
        expect(body.type).to.equal('postcode');
        expect(body.osm_id).to.equal('1185415');
        expect(body.place_id).to.equal('172656313');
        expect(body.boundingbox).to.equal('49.1899493,49.3169125,7.2887621,7.4486507');
        expect(body.lon).to.equal('7.37060801928933');
        expect(body.lat).to.equal('49.2534991');
        expect(body.display_name).to.equal('Kreuzberg, Zweibrücken, Rheinland-Pfalz, 66482, Deutschland');

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with 200 Success for Content-Type application/x-www-form-urlencoded', function(done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "properties": {
          "osm_id": {
            "type": "string"
          },
          "osm_type": {
            "type": "string"
          },
          "place_id": {
            "type": "string"
          },
          "class": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "boundingbox": {
            "type": "string"
          },
          "lat": {
            "type": "string"
          },
          "lon": {
            "type": "string"
          },
          "display_name": {
            "type": "string"
          },
          "importance": {
            "type": "string"
          },
          "licence": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'https://localhost:10011/api/v1/de/postcodes/object/66482',
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + process.env.OAUTH_2
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(200);

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with default Error for missing token for Content-Type application/json', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'https://localhost:10011/api/v1/de/postcodes/object/66482',
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(401);

        expect(res.body.code).to.equal("missing_authorization");

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with default Error for missing token for Content-Type application/x-www-form-urlencoded', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'https://localhost:10011/api/v1/de/postcodes/object/66482',
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(401);

        expect(res.body.code).to.equal("missing_authorization");

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with default Error for wrong token for Content-Type application/json', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'https://localhost:10011/api/v1/de/postcodes/object/66482',
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer AnoTHERWrOnGToKen123456'
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(401);

        expect(res.body.code).to.equal("invalid_token");

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with default Error for wrong token for Content-Type application/x-www-form-urlencoded', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'https://localhost:10011/api/v1/de/postcodes/object/66482',
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer AnoTHERWrOnGToKen123456'
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(401);

        expect(res.body.code).to.equal("invalid_token");

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with default Error for wrong param pattern for Content-Type application/json', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'https://localhost:10011/api/v1/de/postcodes/object/noPostcode',
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.OAUTH_2
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(400);

        expect(res.body.failedValidation).to.be.true;

        expect(res.body.code).to.equal("PATTERN");

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with default Error for wrong param pattern for Content-Type application/x-www-form-urlencoded', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'https://localhost:10011/api/v1/de/postcodes/object/noPostcode',
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + process.env.OAUTH_2
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(400);

        expect(res.body.code).to.equal("PATTERN");

        expect(res.body.failedValidation).to.be.true;

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

  });

});
