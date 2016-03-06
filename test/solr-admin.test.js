/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */
'use strict';
const chai = require('chai'),
  should = chai.should(),
  config = require('config'),
  fs = require('fs'),
  path = require('path'),
  Promise = require('bluebird'),
  request = Promise.promisifyAll(require('request')),
  solrAdmin = require('../lib/index/solr-admin'),
  solrIndex = require('../lib/index/solr-index');

function deleteCollection(collectionName) {
  const solrUrl = `http://${config.get('dbConfig.solr.host')}:` +
        `${config.get('dbConfig.solr.port')}/solr/admin/collections`;
  return request.postAsync({
    url: solrUrl,
    qs: {
      action: 'DELETE', name: collectionName, wt: 'json'
    },
    json: true
  })
  .spread((response, body) => {
    if (response.statusCode === 200 && body.responseHeader.status === 0) {
      console.log(`Solr test collection ${collectionName} has been deleted.`);
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Failed to delete collection: ${collectionName}` +
      ` + '. Reason: ${body.error.msg}`));
  });
}

describe('Test Solr admin and index modules.', function () {
  this.timeout(0);
  const testUICollection = 'test_ui_collection',
    testListingCollection = 'test_listing_collection',
    testUIField = { name: 'package_name', type: 'string',
                    indexed: true, required: true, stored: true },
    testListingField = { name: 'n', type: 'string',
                        indexed: true, required: true, stored: true },
    invalidUITagFile = path.resolve(__dirname, '../indexes/invalid.file-ui-tag.txt');

  before((done) => {
    fs.writeFileSync(invalidUITagFile, '');
    solrAdmin.createCollection(testUICollection)
        .then(() => {
          return solrAdmin.createCollection(testListingCollection);
        })
        .then(() => {
          console.log('Adding a new field to ', testUICollection);
          return solrAdmin.addField(testUICollection, testUIField);
        })
        .then(() => {
          console.log('Adding a new field to ', testListingCollection);
          return solrAdmin.addField(testListingCollection, testListingField);
        })
        .then(() => {
          done();
        })
        .catch((e) => {
          done(e);
        });
  });

  it(`It should ensure that both test collections (${testUICollection} and ` +
     `${testListingCollection}) exist.`, (done) => {
    solrAdmin.exists(testUICollection)
    .then(() => {
      return solrAdmin.exists(testListingCollection);
    })
    .then(() => {
      done();
    }).catch((e) => {
      done(e);
    });
  });

  it('It should ensure that a collection named no-collection does not exist.', (done) => {
    solrAdmin.exists('no-collection')
      .then((res) => {
        should.not.exist(res);
        done(new Error('collection should not exist.'));
      })
      .catch((e) => {
        should.exist(e);
        done();
      });
  });

  it('It should not create a collection that already exists', (done) => {
    solrAdmin.createCollection(testUICollection).then((res) => {
      res.should.contain('already exist');
      done();
    })
    .catch((e) => {
      should.not.exist(e);
      done(e);
    });
  });

  it('It should not create a field that already exists', (done) => {
    solrAdmin.addField(testUICollection, testUIField).then((res) => {
      res.should.contain('already exist');
      done();
    })
    .catch((e) => {
      should.not.exist(e);
      done(e);
    });
  });

  it('It should not create an invalid field', (done) => {
    solrAdmin.addField(testUICollection, 'test').then((res) => {
      should.not.exist(res);
      done(new Error('An invalid field has been created.'));
    })
    .catch((e) => {
      should.exist(e);
      done();
    });
  });

  it('It should ensure that the test field has been added to the test collection.', (done) => {
    const solrUrl = `http://${config.get('dbConfig.solr.host')}:` +
            `${config.get('dbConfig.solr.port')}/solr/${testUICollection}/schema/fields`;
    return request.getAsync({
      url: solrUrl,
      qs: { wt: 'json' }
    })
    .spread((response, body) => {
      response.statusCode.should.be.equal(200);
      const resObj = JSON.parse(body);
      resObj.responseHeader.status.should.be.equal(0);
      resObj.fields.should.deep.include.members([testUIField]);
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('It should index a ui tag file.', (done) => {
    const uiTagFile = path.resolve(__dirname, '../indexes/ui/tag/2/me.pou.app-188-ui-tag.txt');
    solrIndex.indexFile([uiTagFile], '-ui-tag.txt', testUICollection).then(() => {
      return solrIndex.commit(testUICollection);
    })
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('It should handle indexing a ui tag file with a missing required key.', (done) => {
    // It should not index a file with no version_code but it should log the error and move on.
    solrIndex.indexFile([invalidUITagFile], '-ui-tag.txt', testUICollection).then(() => {
      return solrIndex.commit(testUICollection);
    })
    .then(() => {
      done();
    })
    .catch((e) => {
      should.not.exist(e);
      done(e);
    });
  });

  it('It should index a listing details file.', (done) => {
    const listingFile = path.resolve(__dirname, '../fixtures/listing/2/me.pou.app-188.json'),
      content = fs.readFileSync(listingFile, 'utf8'),
      listing = JSON.parse(content);
    solrIndex.indexListing(JSON.stringify(listing), testListingCollection).then(() => {
      return solrIndex.commit(testListingCollection);
    })
    .then(() => {
      done();
    })
    .catch((e) => {
      should.not.exist(e);
      done();
    });
  });

  it('It should not commit changes to a collection that does not exist', (done) => {
    solrIndex.commit('no_such_collection')
    .then(() => {
      done(new Error('It should not commit to a collection that does not exist.'));
    })
    .catch((e) => {
      should.exist(e);
      done();
    });
  });

  after((done) => {
    fs.unlinkSync(invalidUITagFile);
    deleteCollection(testUICollection)
    .then(() => {
      return deleteCollection(testListingCollection);
    })
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });
});
