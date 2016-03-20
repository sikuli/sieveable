/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */

'use strict';
const Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs')),
  _ = require('lodash'),
  config = require('config'),
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
  const fixturesDir = path.join(__dirname, '..', 'fixtures', 'examples', 'manifest');
  return fs.readFileAsync(path.join(fixturesDir, fileName), 'utf-8');
}

describe('Manifest Examples: Answers to multiple manifest by example questions.', function () {
  this.timeout(60000);

  it('q1: It should search for apps that use android.permission.CAMERA\n' +
    'and find 29 apps.', (done) => {
    getFileContent('q1.json')
    .then((resultQ1) => {
      const manifestQuery = '<uses-permission android:name="android.permission.CAMERA"/>',
        q = `MATCH app\nWHERE\n${manifestQuery}\nRETURN app`;
      return testApiAsync(q, JSON.parse(resultQ1), true);
    })
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('q2: It should search for apps that request 20 permissions\n' +
    'and find 33 apps.', (done) => {
    Promise.all([getFileContent('q2.xml'), getFileContent('q2.json')])
    .spread((queryFileQ2, resultQ2) => {
      const q = `MATCH app\nWHERE\n${queryFileQ2}\nRETURN app`;
      return testApiAsync(q, JSON.parse(resultQ2), true);
    })
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('q3: It should search for apps that request 3 permissions\n' +
    'BLUETOOTH, RECORD_AUDIO, and INTERNET and find 33 apps.', (done) => {
    Promise.all([getFileContent('q3.xml'), getFileContent('q3.json')])
    .spread((queryFileQ3, resultQ3) => {
      const q = `MATCH app\nWHERE\n${queryFileQ3}\nRETURN app`;
      return testApiAsync(q, JSON.parse(resultQ3), true);
    })
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('q4: it should search for the following example: \n' +
    '<uses-permission/>\nand returns a number of apps equal to the limit ' +
    `defined in the config file (${config.get('results.maxManifest')})`, (done) => {
    const q = 'MATCH app\nWHERE <uses-permission/>\nRETURN app',
      expected = Array(config.get('results.maxManifest'));
    testApiAsync(q, expected, false)
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  /* TODO: test for __excatly
  * const manifestQuery = '<uses-permission android:name= "android.permission.*"' +
  * ' __exactly="11"/>'
  */
});
