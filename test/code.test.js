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
  should = chai.should(),
  eyes = require('eyes'),
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
  const fixturesDir = path.join(__dirname, '..', 'fixtures', 'examples', 'code');
  return fs.readFileAsync(path.join(fixturesDir, fileName), 'utf-8');
}

describe('Code Examples: Answers to multiple code by example questions.', function () {
  // The entire test suite may timeout in a minute
  this.timeout(60000);
  it('q1: It should search for apps that use the API calls: ' +
    'android.hardware.CAMERA.takePicture and android.hardware.CAMERA.startPreview\n' +
    'The result should be equal to 7 apps.', (done) => {
    const codeQuery =
          '<code class="android.hardware.Camera" method ="takePicture" />\n' +
          '<code class="android.hardware.Camera" method ="startPreview" />',
      q = `MATCH app\nWHERE\n${codeQuery}\nRETURN app`;
    getFileContent('q1.json')
    .then((resultQ1) => {
      return testApiAsync(q, JSON.parse(resultQ1), true);
    })
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('q2: It should search for apps that use the API call ' +
    'com.google.android.gms.location.LocationListener.takePicture\n' +
    'and find 7 apps.', (done) => {
    const codeQuery = '<code class="com.google.android.gms.location.LocationListener"' +
      ' method ="onLocationChanged" />\n',
      q = `MATCH app\nWHERE\n${codeQuery}\nRETURN app`;
    getFileContent('q2.json')
    .then((resultQ2) => {
      return testApiAsync(q, JSON.parse(resultQ2), true);
    })
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });
});
