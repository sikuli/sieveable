/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */
'use strict';
const fs = require('fs'),
  _ = require('lodash'),
  request = require('supertest'),
  path = require('path'),
  app = require('../lib/server/server'),
  chai = require('chai'),
  eyes = require('eyes'),
  should = chai.should();

function testAPI(q, expected, deepMatch, callback) {
  request(app)
  .get('/q')
  .query({ queryText: q })
  .set('Accept', 'application/json')
  .expect(200)
  .end((err, res) => {
    should.not.exist(err);
    should.exist(res.body);
    res.body.should.be.an('array', 'Response body is not an array');
    res.body.should.have.length(expected.length);
    let apps = {};
    try {
      if (deepMatch) {
        apps = _.map(res.body, 'app');
        apps.should.deep.include.members(expected);
      }
    }
    catch (e) {
      console.log('Expected:');
      eyes.inspect(expected);
      console.log('Actual:');
      eyes.inspect(apps);
      throw e;
    }
    callback();
  });
}

function getFileContent(fileName) {
  const fixturesDir = path.join(__dirname, '..', 'fixtures', 'examples', 'listing');
  return fs.readFileSync(path.join(fixturesDir, fileName), 'utf-8');
}

describe('Listing Details Examples: Answers to multiple listing details ' +
  'by example questions.', function () {
  this.timeout(10000);

  const resultQ1 = getFileContent('q1.json'),
    resultQ2 = getFileContent('q2.json'),
    resultQ3 = getFileContent('q3.json'),
    resultQ4 = getFileContent('q4.json');

  it('q1: It should search for apps that have the word Google in their title ' +
    'and find 16 apps.', (done) => {
    const listingQuery = '<title>Google</title>',
      q = `MATCH app\nWHERE\n${listingQuery}\n RETURN app`,
      expected = JSON.parse(resultQ1);
    testAPI(q, expected, true, () => {
      done();
    });
  });

  it('q2: It should search for apps with downloads count between of 500,000,000' +
      ' and 1,000,000,000 and find 13 apps.', (done) => {
    const listingQuery = '<downloads-count-text>500,000,000 - 1,000,000,000' +
        '</downloads-count-text>',
      q = `MATCH app\nWHERE\n${listingQuery}\n RETURN app`,
      expected = JSON.parse(resultQ2);
    testAPI(q, expected, true, () => {
      done();
    });
  });

  it('q3: It should search for apps with the word PDF ' +
      'in their listing details using the full text index ' +
      'and find 2 apps.', (done) => {
    const listingQuery = '<description>PDF</description>',
      q = `MATCH app\nWHERE\n${listingQuery}\nRETURN app`,
      expected = JSON.parse(resultQ3);
    testAPI(q, expected, true, () => {
      done();
    });
  });

  it('q4: It should search for apps by providing multiple listing details ' +
      'fields using the full text index along with absolute values search.', (done) => {
    const listingQuery = '<description>Hats and Eyeglasses</description>'
        + '<price>Free</price>'
        + '<store-category>Casual</store-category>',
      q = `MATCH app\nWHERE\n${listingQuery}\nRETURN app`,
      expected = JSON.parse(resultQ4);
    testAPI(q, expected, true, () => {
      done();
    });
  });

  it('q5: It should search for apps that have 4.5 or more star ' +
      'ratings and find 13 apps.', (done) => {
    const listingQuery = '<rating> $gte:4.5 </rating>',
      q = `MATCH app\nWHERE\n${listingQuery}\n RETURN app`;
    testAPI(q, Array(13), false, () => {
      done();
    });
  });

  it('q6: It should search for apps that have more than 4.5817795 star ' +
     'ratings and find 6 apps.', (done) => {
    const listingQuery = '<rating> $gt:4.5817795 </rating>',
      q = `MATCH app\nWHERE\n${listingQuery}\n RETURN app`;
    testAPI(q, Array(6), false, () => {
      done();
    });
  });

  it('q7: It should search for apps that have less than or equal 3.8888636 star ' +
      'ratings and find 8 apps.', (done) => {
    const listingQuery = '<rating> $lte:3.8888636 </rating>',
      q = `MATCH app\nWHERE\n${listingQuery}\n RETURN app`;
    testAPI(q, Array(8), false, () => {
      done();
    });
  });

  it('q8: It should search for apps that have less than 3.8888636 star ' +
      'ratings and find 7 apps.', (done) => {
    const listingQuery = '<rating> $lt:3.8888636 </rating>',
      q = `MATCH app\nWHERE\n${listingQuery}\nRETURN app`;
    testAPI(q, Array(7), false, () => {
      done();
    });
  });

  it('q9: test an invalid listing query. It should return no apps and ' +
    'log an error message', (done) => {
    const listingQuery = '<rating> </rating>',
      q = `MATCH app\nWHERE\n${listingQuery}\nRETURN app`;
    testAPI(q, Array(0), false, () => {
      done();
    });
  });

  it('q10: It should search for apps that have a minimum download count of ' +
    '1,000,000,000 downloads and find one app.', (done) => {
    const listingQuery = '<downloads>1000000000</downloads>',
      q = `MATCH app\nWHERE\n${listingQuery}\n RETURN app`,
      expected = [{ id: 'com.google.android.gm-4800250',
                    packageName: 'com.google.android.gm',
                    version: '4800250'
                  }];
    testAPI(q, expected, true, () => {
      done();
    });
  });
});
