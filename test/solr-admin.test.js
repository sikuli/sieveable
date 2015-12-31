'use strict';
const chai = require('chai'),
    should = chai.should(),
    config = require('config'),
    Promise = require('bluebird'),
    request = Promise.promisifyAll(require('request')),
    solrAdmin = require('../lib/index/solr-admin');

describe('Test Solr admin/util module.', function() {
    this.timeout(0);
    const testCollection = 'test-collection',
        testField = { 'name': 'package_name', 'type': 'string',
                      'indexed': true, 'required': true, 'stored': true
                    };

    before((done) => {
      solrAdmin.createCollection(testCollection)
          .then(() => {
              console.log('Adding a new field to ' + testCollection);
              return solrAdmin.addField(testCollection, testField);
          })
          .then(() => {
              done();
          })
          .catch((e) => {
              done(e);
          });
    });

    it('It should ensure that the test collection ('
        + testCollection + ') exists.', (done) => {
            solrAdmin.exists(testCollection).then(() => {
                done();
            }).catch((e) => {
                done(e);
            });
    });

    it('It should ensure that a collection named no-collection does not exist.', (done) => {
        solrAdmin.exists('no-collection')
            .then((res) => {
                should.not.exist(res);
                done(new Error('collection should not exist.')); })
            .catch((e) => {
                should.exist(e);
                done();
            });
    });

    it('It should not create a collection that already exists', (done) => {
        solrAdmin.createCollection(testCollection).then((res) => {
            res.should.contain('already exist');
            done();
        }).catch((e) => {
            should.not.exist(e);
            done(e);
        });
    });

    it('It should not create a field that already exists', (done) => {
        solrAdmin.addField(testCollection, testField).then((res) => {
            res.should.contain('already exist');
            done();
        }).catch((e) => {
            should.not.exist(e);
            done(e);
        });
    });

    it('It should not create an invalid field', (done) => {
        solrAdmin.addField(testCollection, 'test').then((res) => {
            should.not.exist(res);
            done(new Error('An invalid field has been created.'));
        }).catch((e) => {
            should.exist(e);
            done();
        });
    });

    it('It should ensure that the test field has been added to the test collection.', (done) => {
        const solrUrl = 'http://' + config.get('dbConfig.solr.host') + ':' +
            config.get('dbConfig.solr.port') + '/solr/' + testCollection + '/schema/fields';
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
              action: 'DELETE', name: testCollection, wt: 'json'
          },
          json: true
      }).spread((response, body) => {
          if (response.statusCode === 200 && body.responseHeader.status === 0) {
              console.log('Solr test collection ' + testCollection + ' has been deleted.');
              done();
          }
          else {
              throw new Error('Failed to delete our test collection: '
                  + testCollection + '. Reason: ' + body.error.msg);
          }
      }).catch((e) => {
          done(e);
      });
    });
});
