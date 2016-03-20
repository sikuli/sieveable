/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */
'use strict';
const Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs')),
  path = require('path'),
  request = require('supertest'),
  app = require('../lib/server/server'),
  chai = require('chai'),
  eyes = require('eyes'),
  should = chai.should(),
  testApiAsync = Promise.promisify(testAPI);

function testAPI(q, expected, deepMatch, callback) {
  return request(app)
  .get('/q')
  .query({ queryText: q })
  .set('Accept', 'application/json')
  .expect(200)
  .end((err, res) => {
    should.not.exist(err);
    should.exist(res.body);
    res.body.should.have.length(expected.length);
    try {
      if (deepMatch) {
        res.body.should.deep.include.members(expected);
      }
    }
    catch (e) {
      console.log('Expected:');
      eyes.inspect(expected);
      console.log('Actual:');
      eyes.inspect(res.body);
      throw e;
    }
    callback();
  });
}

function getFileContent(fileName) {
  const fixturesDir = path.join(__dirname, '..', 'fixtures', 'examples', 'projection');
  return fs.readFileAsync(path.join(fixturesDir, fileName), 'utf-8');
}

describe('Query Projection', function () {
  this.timeout(30000);

  it('q1: it should search for apps by matching text ' +
      'wildcards and returning their permissions and the text value of ' +
      'their buttons using the $ symbol. Three apps must be found.\n', (done) => {
    const query = 'MATCH app\n' +
          'WHERE\n' +
          '<uses-permission android:name = "(android.permission.READ_*)"/>' +
          '<description>ch*t SMS</description>\n' +
          '<store-category>(*)</store-category>\n' +
          '<Button android:text="(*)"></Button>\n' +
          'RETURN app, $1, $2, $3';
    getFileContent('q1.json')
      .then((q1ResultFile) => {
        const expectedResult = JSON.parse(q1ResultFile);
        return testApiAsync(query, expectedResult, true);
      })
      .then(() => {
        done();
      })
      .catch((e) => {
        done(e);
      });
  });

  it('q2: it should search for apps by matching ' +
    'wildcards and return the results using name aliases. ' +
    'It must find 4 apps\n', (done) => {
    const query = 'MATCH app\nWHERE\n' +
          '<uses-permission android:name="(android.permission.ACCESS_*)"/>\n' +
          '<developer>Facebook</developer>\n' +
          '<title>(*)</title>\n' +
          '<Button android:text="(*)"></Button>\n' +
          'RETURN app, m$1 as permissions, l$1 as title, u$1 as buttonText';
    getFileContent('q2.json')
      .then((q2ResultFile) => {
        const expectedResult = JSON.parse(q2ResultFile);
        return testApiAsync(query, expectedResult, true);
      })
      .then(() => {
        done();
      })
      .catch((e) => {
        done(e);
      });
  });

  it('q3: it should search for apps with the ACCESS_FINE_LOCATION ' +
    'and return the latest app version. \n', (done) => {
    const query = 'MATCH app(latest=true)\n' +
          'WHERE\n' +
          '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>\n' +
          'RETURN app';
    getFileContent('q3.json')
      .then((q3ResultFile) => {
        const expectedResult = JSON.parse(q3ResultFile);
        return testApiAsync(query, expectedResult, true);
      })
      .then(() => {
        done();
      })
      .catch((e) => {
        done(e);
      });
  });

  it('q4: it should return all store categories \n', (done) => {
    const query = 'MATCH app\nWHERE\n' +
        '<store-category>(*)</store-category>"\n' +
        'RETURN app, $1';
    getFileContent('q4.json')
      .then((q4ResultFile) => {
        return testApiAsync(query, JSON.parse(q4ResultFile), true);
      })
      .then(() => {
        done();
      })
      .catch((e) => {
        done(e);
      });
  });

  it('q5: it should find apps whose title contain the word Google and return the ' +
     'latest app version. \n', (done) => {
    const query = 'MATCH app(latest=true)\nWHERE\n' +
                      '<title>Google</title>"\n' +
                      'RETURN app';
    getFileContent('q5.json')
      .then((q5ResultFile) => {
        return testApiAsync(query, JSON.parse(q5ResultFile), true);
      })
      .then(() => {
        done();
      })
      .catch((e) => {
        done(e);
      });
  });

  it('q6: It should search for the latest version of the Google Music app ' +
     'that uses the AdMob class "com.google.android.gms.ads"\n' +
     'and find one app version.', (done) => {
    const query = 'MATCH app(package=com.google.android.music, latest=true)' +
          ` \nWHERE\n<code class="com.google.android.gms.ads" />\nRETURN app`,
      expectedResult = [{
        app: {
          id: 'com.google.android.music-1514',
          packageName: 'com.google.android.music',
          version: '1514'
        },
        listing: {},
        ui: {},
        manifest: {}
      }];

    testApiAsync(query, expectedResult, true)
      .then(() => {
        done();
      })
      .catch((e) => {
        done(e);
      });
  });
});
