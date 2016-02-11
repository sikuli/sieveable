'use strict';
const request = require('supertest'),
  server = require('../lib/server/server'),
  chai = require('chai'),
  _ = require('lodash'),
  should = chai.should();

describe('Test API client errors.', function() {
  this.timeout(1000);

  it('It should return 422 when submitting a query without the required field queryText', function(done) {
    request(server)
        .get('/q')
        .query({})
        .set('Accept', 'application/json')
        .expect(422)
        .end((err, res) => {
          res.statusCode.should.equal(422);
          res.body.should.be.an('object');
          done();
        });
  });

  it('It should return 400 when submitting an invalid queryText', function(done) {
    request(server)
        .get('/q')
        .query({ queryText: 'FOO BAR' })
        .set('Accept', 'application/json')
        .expect(400)
        .end((err, res) => {
          res.statusCode.should.equal(400);
          res.body.should.be.an('object');
          done();
        });
  });

  it('It should return 404 for submitted queries', function(done) {
    request(server)
        .get('/foo')
        .query({ foo: 'bar' })
        .set('Accept', 'application/json')
        .expect(404)
        .end((err, res) => {
          res.statusCode.should.equal(404);
          _.isEmpty(res.body).should.equal(true);
          done();
        });
  });
});
