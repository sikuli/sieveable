/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */
'use strict';

const Promise = require('bluebird'),
  config = require('config'),
  redis = require('redis'),
  _ = require('lodash'),
  chai = require('chai'),
  solrAdmin = require('../lib/index/solr-admin'),
  should = chai.should();

describe('Test that all external db servers are running using their ' +
  'respected configuration options.', function () {
  this.timeout(10000);
  it('It should ensure that Solr is running all the collections defined ' +
      'in the config file exist.', (done) => {
    Promise.all([
      solrAdmin.exists(config.get('dbConfig.solr.listingCollection')),
      solrAdmin.exists(config.get('dbConfig.solr.codeCollection')),
      solrAdmin.exists(config.get('dbConfig.solr.uiSuffixCollection')),
      solrAdmin.exists(config.get('dbConfig.solr.uiTagCollection')),
      solrAdmin.exists(config.get('dbConfig.solr.manifestCollection'))])
      .then(() => {
        done();
      }).catch((e) => {
        console.error('ERROR: ', e);
        should.not.exist(e);
      });
  });

  it('It should ensure that Redis is running at localhost:6379 ' +
    'and has all the keys defined in the config file.', (done) => {
    const redisConfig = config.get('dbConfig.redis'),
      datasetConfig = config.get('dataset'),
      keys = [datasetConfig.listingKeyName,
        datasetConfig.uiKeyName,
        datasetConfig.manifestKeyName,
        datasetConfig.codeKeyName],
      client = redis.createClient({ host: redisConfig.host, port: redisConfig.port });
    client.on('ready', () => {
      _.forEach(keys, (key, idx) => {
        client.exists(key, (err, res) => {
          res.should.equal(1);
          if (idx === keys.length - 1) {
            client.quit();
            done();
          }
        });
      });
    });
    client.on('error', (error) => {
      client.quit();
      throw new Error(`Redis client error ${error.message}`);
    });
  });
});
