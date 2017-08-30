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

describe('/api/v1/{de}/{postcodes}/names', function() {
  describe('get', function() {
    it('should respond with 200 Success for Content-Type application/json', function(done) {
      /*eslint-disable*/
      var schema = {
        "type": "array",
        "items": {
          "type": "string"
        }
      };

      /*eslint-enable*/
      request({
        url: 'https://localhost:10011/api/v1/de/postcodes/names',
        json: true,
        qs: {
          leadRegion: '19'
        },
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.OAUTH_2
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(200);

        expect(body.length).to.equal(8);

        expect(body[0]).to.equal('19053 Schwerin Paulsstadt');
        expect(body[1]).to.equal('19055 Schwerin Schelfwerder');
        expect(body[2]).to.equal('19057 Schwerin Sacktannen');
        expect(body[3]).to.equal('19059 Schwerin Weststadt');
        expect(body[4]).to.equal('19061 Schwerin Krebsförden');
        expect(body[5]).to.equal('19063 Schwerin Mueß');
        expect(body[6]).to.equal('19073 Grambow Zülow Lützow-Lübstorf');
        expect(body[7]).to.equal('19374 Herzberg Obere Warnow');

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with 200 Success for Content-Type application/x-www-form-urlencoded', function(done) {
      /*eslint-disable*/
      var schema = {
        "type": "array",
        "items": {
          "type": "string"
        }
      };

      /*eslint-enable*/
      request({
        url: 'https://localhost:10011/api/v1/de/postcodes/names',
        json: true,
        qs: {
          leadRegion: '19'
        },
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + process.env.OAUTH_2
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(200);

        expect(body.length).to.equal(8);

        expect(body[0]).to.equal('19053 Schwerin Paulsstadt');
        expect(body[1]).to.equal('19055 Schwerin Schelfwerder');
        expect(body[2]).to.equal('19057 Schwerin Sacktannen');
        expect(body[3]).to.equal('19059 Schwerin Weststadt');
        expect(body[4]).to.equal('19061 Schwerin Krebsförden');
        expect(body[5]).to.equal('19063 Schwerin Mueß');
        expect(body[6]).to.equal('19073 Grambow Zülow Lützow-Lübstorf');
        expect(body[7]).to.equal('19374 Herzberg Obere Warnow');

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
        url: 'https://localhost:10011/api/v1/de/postcodes/names',
        json: true,
        qs: {
          leadRegion: '25'
        },
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
        url: 'https://localhost:10011/api/v1/de/postcodes/names',
        json: true,
        qs: {
          leadRegion: '25'
        },
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
        url: 'https://localhost:10011/api/v1/de/postcodes/names',
        json: true,
        qs: {
          leadRegion: '25'
        },
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer WrOnGToKen123456'
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
        url: 'https://localhost:10011/api/v1/de/postcodes/names',
        json: true,
        qs: {
          leadRegion: '25'
        },
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer WrOnGToKen123456'
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

    it('should respond with default Error for wrong qs pattern for Content-Type application/json', function(done) {
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
        url: 'https://localhost:10011/api/v1/de/postcodes/names',
        json: true,
        qs: {
          leadRegion: 'noNumber'
        },
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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

    it('should respond with default Error for wrong qs pattern for Content-Type application/x-www-form-urlencoded', function(done) {
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
        url: 'https://localhost:10011/api/v1/de/postcodes/names',
        json: true,
        qs: {
          leadRegion: 'noNumber'
        },
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
