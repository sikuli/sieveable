/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */
'use strict';
const Promise = require('bluebird'),
  chai = require('chai'),
  should = chai.should(),
  config = require('config'),
  fs = Promise.promisifyAll(require('fs')),
  path = require('path'),
  request = Promise.promisifyAll(require('request'), { multiArgs: true }),
  solrAdmin = require('../lib/index/solr-admin'),
  solrIndex = require('../lib/index/solr-index');

describe('Test Solr admin and index modules.', function () {
  this.timeout(30000);
  const uiTagCollectionName = config.get('dbConfig.solr.uiTagCollection'),
    randomCollectionName = `tmp-${Math.random().toString()}`,
    existingField = { name: 'package_name', type: 'string',
                    indexed: true, required: true, stored: true };

  it(`ensures that a required collection (${uiTagCollectionName}) exists`, (done) => {
    solrAdmin.exists(uiTagCollectionName)
    .then(() => {
      done();
    }).catch((e) => {
      done(e);
    });
  });

  it(`ensures that a collection named (${randomCollectionName}) does not exist`, (done) => {
    solrAdmin.exists(randomCollectionName)
      .then((res) => {
        should.not.exist(res);
        done(new Error('collection should not exist.'));
      })
      .catch((e) => {
        should.exist(e);
        done();
      });
  });

  it('does not create a field that already exists', (done) => {
    solrAdmin.addField(uiTagCollectionName, existingField).then((res) => {
      res.should.contain('already exist');
      done();
    })
    .catch((e) => {
      should.not.exist(e);
      done(e);
    });
  });

  it('does not add an invalid field to a collection', (done) => {
    solrAdmin.addField(uiTagCollectionName, 'test').then((res) => {
      should.not.exist(res);
      done(new Error('An invalid field has been created.'));
    })
    .catch((e) => {
      should.exist(e);
      done();
    });
  });

  it('ensures that a required field has been added to ' +
    `a required collection (${uiTagCollectionName})`, (done) => {
    const solrUrl = `http://${config.get('dbConfig.solr.host')}:` +
            `${config.get('dbConfig.solr.port')}/solr/${uiTagCollectionName}/schema/fields`;
    return request.getAsync({
      url: solrUrl,
      qs: { wt: 'json' }
    })
    .spread((response, body) => {
      response.statusCode.should.be.equal(200);
      const resObj = JSON.parse(body);
      resObj.responseHeader.status.should.be.equal(0);
      resObj.fields.should.deep.include.members([existingField]);
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('indexes a ui tag file.', (done) => {
    const uiTagFile = path.resolve(__dirname, '../indexes/ui/tag/2/me.pou.app-188-ui-tag.txt');
    solrIndex.indexFile([uiTagFile], '-ui-tag.txt', uiTagCollectionName).then(() => {
      return solrIndex.commit(uiTagCollectionName);
    })
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('handles indexing a ui tag file with a missing required key', (done) => {
    // It should not index a file with no version_code but it should log the error and move on.
    const invalidUITagFile = path.resolve(__dirname, '../indexes/invalid.file-ui-tag.txt');
    solrIndex.indexFile([invalidUITagFile], '-ui-tag.txt', uiTagCollectionName)
    .then(() => {
      done(new Error('An invalid file has been indexed'));
    })
    .catch((e) => {
      should.exist(e);
      done();
    });
  });

  it('indexes a listing details file.', (done) => {
    const listingCollectionName = config.get('dbConfig.solr.listingCollection'),
      listingFile = path.resolve(__dirname, '../fixtures/listing/2/me.pou.app-188.json');
    fs.readFileAsync(listingFile, 'utf8')
    .then((content) => {
      return solrIndex.indexListing(content, listingCollectionName);
    })
    .then(() => {
      return solrIndex.commit(listingCollectionName);
    })
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('does not commit changes to a collection that does not exist', (done) => {
    solrIndex.commit(randomCollectionName)
    .then(() => {
      done(new Error('It should not commit to a collection that does not exist.'));
    })
    .catch((e) => {
      should.exist(e);
      done();
    });
  });
});
