'use strict';
var chai = require('chai');
var request = require('request');
var expect = chai.expect;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('/swagger/', function() {
  describe('get', function() {
    
    it('should respond with 200 Success for Content-Type application/json', function(done) {
      request({
        url: 'https://localhost:10011/swagger/',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(200);

        expect(body).to.not.equal(null); // no schema
        done();
      });
    });

    it('should respond with 200 Success for Content-Type application/x-www-form-urlencoded', function(done) {
      request({
        url: 'https://localhost:10011/swagger/',
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(200);

        expect(body).to.not.equal(null); // no schema
        done();
      });
    });

    it('should respond with 404 Error for wrong path for Content-Type application/json', function(done) {
      request({
        url: 'https://localhost:10011/swagger/wrong-path',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(404);

        expect(body).to.not.equal(null); // no schema
        done();
      });
    });

    it('should respond with 404 Error for wrong path for Content-Type application/x-www-form-urlencoded', function(done) {
      request({
        url: 'https://localhost:10011/swagger/wrong-path',
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(404);

        expect(body).to.not.equal(null); // no schema
        done();
      });
    });

  });

});
