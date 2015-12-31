'use strict';
const chai = require('chai'),
    should = chai.should(),
    config = require('config'),
    Promise = require('bluebird'),
    request = Promise.promisifyAll(require('request')),
    solrAdmin = require('../lib/index/solr-admin');

describe('Test Solr admin/util module.', function() {
    this.timeout(0);
    const solrTestCollection = 'test-collection',
        testField = { 'name': 'package_name', 'type': 'string',
                      'indexed': true, 'required': true, 'stored': true
                    };

    before((done) => {
      solrAdmin.createCollection(solrTestCollection)
          .then(() => {
              return solrAdmin.addField(solrTestCollection, testField);
          })
          .then(() => {
              done();
          })
          .catch((e) => {
              done(e);
          });
    });

    it('It should ensure that the test collection ('
        + solrTestCollection + ') exists.', (done) => {
            solrAdmin.exists(solrTestCollection).then(() => {
                done();
            }).catch((e) => {
                done(e);
            });
    });

    it('It should ensure that the test field has been added to the test collection.', (done) => {
        const solrUrl = 'http://' + config.get('dbConfig.solr.host') + ':' +
            config.get('dbConfig.solr.port') + '/solr/' + solrTestCollection + '/schema/fields';
        return request.getAsync({
            url: solrUrl,
            qs: { wt: 'json' }
        }).spread((response, body) => {
            response.statusCode.should.be.equal(200);
            const resObj = JSON.parse(body);
            resObj.responseHeader.status.should.be.equal(0);
            resObj.fields.should.deep.include.members([testField]);
            done();
        }).catch((e) => {
            done(e);
      });
    });

    after((done) => {
      const solrUrl = 'http://' + config.get('dbConfig.solr.host') + ':' +
          config.get('dbConfig.solr.port') + '/solr/admin/collections';
      return request.postAsync({
          url: solrUrl,
          qs: {
              action: 'DELETE', name: solrTestCollection, wt: 'json'
          },
          json: true
      }).spread((response, body) => {
          if (response.statusCode === 200 && body.responseHeader.status === 0) {
              console.log('Solr test collection ' + solrTestCollection + ' has been deleted.');
              done();
          }
          else {
              throw new Error('Failed to delete our test collection: '
                  + solrTestCollection + '. Reason: ' + body.error.msg);
          }
      }).catch((e) => {
          done(e);
      });
    });
});
