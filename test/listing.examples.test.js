/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */
'use strict';
const Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs')),
  _ = require('lodash'),
  request = require('supertest'),
  path = require('path'),
  app = require('../lib/server/server'),
  chai = require('chai'),
  eyes = require('eyes'),
  should = chai.should(),
  testApiAsync = Promise.promisify(testApi);

function testApi(q, expected, deepMatch, callback) {
  request(app)
  .get('/q')
  .query({ queryText: q })
  .set('Accept', 'application/json')
  .expect(200)
  .end((err, res) => {
    should.not.exist(err);
    should.exist(res.body);
    should.exist(res.body.apps);
    res.body.apps.should.be.an('array', 'Response body is not an array');
    res.body.apps.should.have.length(expected.length);
    let apps = {};
    try {
      if (deepMatch) {
        apps = _.map(res.body.apps, (appObj) => {
          return _.pick(appObj, ['id', 'packageName', 'versionCode', 'versionName']);
        });
        apps.should.deep.include.members(expected);
      }
    }
    catch (e) {
      console.log('Expected:');
      eyes.inspect(expected);
      console.log('Actual:');
      console.log(apps);
      throw e;
    }
    callback();
  });
}

function getFileContent(fileName) {
  const fixturesDir = path.join(__dirname, '..', 'fixtures', 'examples', 'listing');
  return fs.readFileAsync(path.join(fixturesDir, fileName), 'utf-8');
}

describe('Listing Details Examples: Answers to multiple listing details ' +
  'by example questions.', function () {
  this.timeout(10000);

  it('q1: It should search for apps that have the word Google in their title ' +
    'and find 16 apps.', (done) => {
    getFileContent('q1.json')
    .then((resultQ1) => {
      const listingQuery = '<title>Google</title>',
        q = `MATCH app\nWHERE\n${listingQuery}\n RETURN app`;
      return testApiAsync(q, JSON.parse(resultQ1), true);
    })
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('q2: It should search for apps with downloads count between of 500,000,000' +
      ' and 1,000,000,000 and find 13 apps.', (done) => {
    getFileContent('q2.json')
    .then((resultQ2) => {
      const listingQuery = '<downloads-count-text>500,000,000 - 1,000,000,000' +
          '</downloads-count-text>',
        q = `MATCH app\nWHERE\n${listingQuery}\n RETURN app`;
      return testApiAsync(q, JSON.parse(resultQ2), true);
    })
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('q3: It should search for apps with the word PDF ' +
      'in their listing details using the full text index ' +
      'and find 2 apps.', (done) => {
    getFileContent('q3.json')
    .then((resultQ3) => {
      const listingQuery = '<description>PDF</description>',
        q = `MATCH app\nWHERE\n${listingQuery}\nRETURN app`;
      return testApiAsync(q, JSON.parse(resultQ3), true);
    })
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('q4: It should search for apps by providing multiple listing details ' +
      'fields using the full text index along with absolute values search.', (done) => {
    getFileContent('q4.json')
    .then((resultQ4) => {
      const listingQuery = '<description>Hats and Eyeglasses</description>'
        + '<price>Free</price>'
        + '<store-category>Casual</store-category>',
        q = `MATCH app\nWHERE\n${listingQuery}\nRETURN app`;
      return testApiAsync(q, JSON.parse(resultQ4), true);
    })
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('q5: It should search for apps that have 4.5 or more star ' +
      'ratings and find 13 apps.', (done) => {
    const listingQuery = '<rating> $gte:4.5 </rating>',
      q = `MATCH app\nWHERE\n${listingQuery}\n RETURN app`;
    testApiAsync(q, Array(13), false)
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('q6: It should search for apps that have more than 4.5817795 star ' +
     'ratings and find 6 apps.', (done) => {
    const listingQuery = '<rating> $gt:4.5817795 </rating>',
      q = `MATCH app\nWHERE\n${listingQuery}\n RETURN app`;
    testApiAsync(q, Array(6), false)
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('q7: It should search for apps that have less than or equal 3.8888636 star ' +
      'ratings and find 8 apps.', (done) => {
    const listingQuery = '<rating> $lte:3.8888636 </rating>',
      q = `MATCH app\nWHERE\n${listingQuery}\n RETURN app`;
    testApiAsync(q, Array(8), false)
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('q8: It should search for apps that have less than 3.8888636 star ' +
      'ratings and find 7 apps.', (done) => {
    const listingQuery = '<rating> $lt:3.8888636 </rating>',
      q = `MATCH app\nWHERE\n${listingQuery}\nRETURN app`;
    testApiAsync(q, Array(7), false)
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('q9: test an invalid listing query. It should return no apps and ' +
    'log an error message', (done) => {
    const listingQuery = '<rating> </rating>',
      q = `MATCH app\nWHERE\n${listingQuery}\nRETURN app`;
    request(app)
      .get('/q')
      .query({ queryText: q })
      .set('Accept', 'application/json')
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(new Error('Expected the invalid query to not throw an error.'));
        }
        else {
          should.not.exist(res.body.apps);
          done();
        }
      });
  });

  it('q10: It should search for apps that have a minimum download count of ' +
    '1,000,000,000 downloads and find one app.', (done) => {
    const listingQuery = '<downloads>1000000000</downloads>',
      q = `MATCH app\nWHERE\n${listingQuery}\n RETURN app`,
      expected = [{ id: 'com.google.android.gm-4800250',
                    packageName: 'com.google.android.gm',
                    versionCode: 4800250,
                    versionName: '4.8 (1167183)'
                  }];
    testApiAsync(q, expected, true)
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });
});
