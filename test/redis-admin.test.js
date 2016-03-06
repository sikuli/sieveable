/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */

'use strict';
const chai = require('chai'),
  should = chai.should(),
  config = require('config'),
  Promise = require('bluebird'),
  redis = require('redis'),
  redisAdmin = require('../lib/index/redis-admin');

describe('Test redis admin/util module.', function () {
  this.timeout(10000);
  const testKey = 'test-manifest',
    redisClient = redis.createClient();
  redisClient.on('error', (err) => {
    console.error('Redis connection error ', err);
  });

  before((done) => {
    console.log('Inserting test data into Redis.');
    redisAdmin.insertSolrKeys(testKey, config.get('dbConfig.solr.manifestCollection'))
    .then(() => {
      console.log('Successfully inserted data into Redis.');
      done();
    }).catch((e) => {
      console.error(e);
      done(e);
    });
  });

  it('It should ensure that our testKey has 58 values in redis.', (done) => {
    const scardAsync = Promise.promisify(redisClient.scard, redisClient);
    console.log('testKey= ', testKey);
    scardAsync(testKey)
    .then((result) => {
      result.should.equal(58);
      done();
    }).catch((e) => {
      done(e);
    });
  });

  after((done) => {
    redisClient.del(testKey, (err, res) => {
      should.not.exist(err);
      console.log(res);
      if (err) {
        console.error('Failed to delete test key.', err);
        done(err);
      }
      redisClient.quit();
      console.log('Successfully deleted test key in Redis.');
      done();
    });
  });
});
