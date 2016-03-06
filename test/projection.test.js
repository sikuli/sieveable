/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */
'use strict';
const fs = require('fs'),
  path = require('path'),
  request = require('supertest'),
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
  return fs.readFileSync(path.join(fixturesDir, fileName), 'utf-8');
}

describe('Query Projection', function () {
  this.timeout(30000);
  const q1ResultFile = getFileContent('q1.json'),
    q2ResultFile = getFileContent('q2.json'),
    q3ResultFile = getFileContent('q3.json'),
    q4ResultFile = getFileContent('q4.json'),
    q5ResultFile = getFileContent('q5.json');

  it('q1: it should search for apps by matching text ' +
      'wildcards and returning their permissions and the text value of ' +
      'their buttons using the $ symbol. Three apps must be found.\n', (done) => {
    const query = 'MATCH app\n' +
          'WHERE\n' +
          '<uses-permission android:name = "(android.permission.READ_*)"/>' +
          '<description>ch*t SMS</description>\n' +
          '<store-category>(*)</store-category>\n' +
          '<Button android:text="(*)"></Button>\n' +
          'RETURN app, $1, $2, $3',
      expectedResult = JSON.parse(q1ResultFile);
    testAPI(query, expectedResult, true, () => {
      done();
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
          'RETURN app, m$1 as permissions, l$1 as title, u$1 as buttonText',
      expectedResult = JSON.parse(q2ResultFile);
    testAPI(query, expectedResult, true, () => {
      done();
    });
  });

  it('q3: it should search for apps with the ACCESS_FINE_LOCATION ' +
    'and return the latest app version. \n', (done) => {
    const query = 'MATCH app(latest=true)\n' +
          'WHERE\n' +
          '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>\n' +
          'RETURN app',
      expectedResult = JSON.parse(q3ResultFile);
    testAPI(query, expectedResult, true, () => {
      done();
    });
  });

  it('q4: it should return all store categories \n', (done) => {
    const query = 'MATCH app\nWHERE\n' +
        '<store-category>(*)</store-category>"\n' +
        'RETURN app, $1',
      expectedResult = JSON.parse(q4ResultFile);
    testAPI(query, expectedResult, true, () => {
      done();
    });
  });

  it('q5: it should find apps whose title contain the word Google and return the ' +
     'latest app version. \n', (done) => {
    const query = 'MATCH app(latest=true)\nWHERE\n' +
                      '<title>Google</title>"\n' +
                      'RETURN app',
      expectedResult = JSON.parse(q5ResultFile);
    testAPI(query, expectedResult, true, () => {
      done();
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
    testAPI(query, expectedResult, true, () => {
      done();
    });
  });
});
