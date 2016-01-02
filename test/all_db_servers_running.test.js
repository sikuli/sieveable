const Promise = require('bluebird'),
   config = require('config'),
   util = require('util'),
   redis = require('redis'),
   _ = require('lodash'),
   chai = require('chai'),
   solrAdmin = require('../lib/index/solr-admin'),
   should = chai.should();

describe('Test that all external db servers are running using their ' +
    'respected configuration options.', function () {

    it('It should ensure that Solr is running all the collections defined ' +
        'in the config file exist.', function (done) {
        Promise.all([
            solrAdmin.exists(config.get('dbConfig.solr.listingCollection')),
            solrAdmin.exists(config.get('dbConfig.solr.codeCollection')),
            solrAdmin.exists(config.get('dbConfig.solr.uiSuffixCollection')),
            solrAdmin.exists(config.get('dbConfig.solr.uiTagCollection')),
            solrAdmin.exists(config.get('dbConfig.solr.manifestCollection'))])
            .then(function () {
                done();
            })
            .catch(function (e) {
                console.error('ERROR: ' + e.message);
                throw e;
            })
    })

    it('It should ensure that Redis is running at localhost:6379 ' +
        'and has all the keys defined in the config file.', function (done) {
        var dbConfig = config.get('dbConfig.redis');
        var datasetConfig = config.get('dataset');
        var keys = [ datasetConfig.listingKeyName,
            datasetConfig.uiKeyName,
            datasetConfig.manifestKeyName,
            datasetConfig.codeKeyName];
        var client = redis.createClient();
        client.on('ready', function () {
            _.forEach(keys, function (key, idx) {
                client.EXISTS(key, function (err, res) {
                    res.should.equal(1);
                    if (idx == keys.length - 1) {
                        client.quit();
                        done();
                    }
                });
            })
        });
        client.on('error', function (error) {
            client.quit();
            throw new Error('Redis client error ' + client.host + ':' +
                client.port + ' - ' + error);
        });
    });
})
