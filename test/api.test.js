/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */
'use strict';
const request = require('supertest'),
  server = require('../lib/server/server'),
  chai = require('chai'),
  should = chai.should(),
  _ = require('lodash');

function testAPI(q, expectedCode, callback) {
  request(server)
  .get('/q')
  .query(q)
  .set('Accept', 'application/json')
  .expect(expectedCode)
  .end((err, res) => {
    should.not.exist(err);
    res.statusCode.should.equal(expectedCode);
    res.body.should.be.an('object');
    callback();
  });
}

describe('Test API client errors.', function () {
  this.timeout(1000);

  it('It should return 422 when submitting a query without the ' +
  'required field queryText', (done) => {
    testAPI({}, 422, () => {
      done();
    });
  });

  it('It should return 400 when submitting an invalid queryText', (done) => {
    testAPI({ queryText: 'FOO BAR' }, 400, () => {
      done();
    });
  });

  it('It should return 404 for submitted queries', (done) => {
    request(server)
    .get('/foo')
    .query({ foo: 'bar' })
    .set('Accept', 'application/json')
    .expect(404)
    .end((err, res) => {
      res.statusCode.should.equal(404);
      res.body.should.be.an('object');
      _.isEmpty(res.body).should.equal(true);
      done();
    });
  });
});
