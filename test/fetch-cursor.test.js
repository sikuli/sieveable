/* eslint-env node, mocha */

const fetchCursor = require('../lib/findBy/dataset/fetch-cursor'),
  config = require('config'),
  should = require('chai').should();

describe('Test fetching cursors from Solr', () => {
  it('it should return a cursor mark for a simple ui tag collection query', (done) => {
    const collectionName = config.get('dbConfig.solr.uiTagCollection');
    fetchCursor.get(collectionName, 'Button', '*')
    .then((result) => {
      should.exist(result.cursor);
      result.ids.should.have.length.above(1);
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('it should iterate through the cursor and get the next results ' +
  'for a simple ui tag collection query', (done) => {
    const collectionName = config.get('dbConfig.solr.uiTagCollection');
    fetchCursor.get(collectionName, 'Text', '*')
    .then((result) => {
      should.exist(result.cursor);
      result.ids.should.have.length.above(0);
      return [result.cursor, fetchCursor.get(collectionName, 'Text', result.cursor)];
    })
    .spread((prevCursor, result) => {
      should.exist(result.cursor);
      prevCursor.should.not.equal(result.cursor);
      result.ids.should.have.length.above(0);
      return [result.cursor, fetchCursor.get(collectionName, 'Text', result.cursor)];
    })
    .spread((prevCursor, result) => {
      // The two cursor should be equal because we reached the end of the result set.
      prevCursor.should.equal(result.cursor);
      result.ids.should.have.length(0);
      done();
    })
    .catch((e) => {
      done(e);
    });
  });
});
