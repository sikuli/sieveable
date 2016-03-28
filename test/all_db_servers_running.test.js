/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */
'use strict';

const Promise = require('bluebird'),
  config = require('config'),
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
});
