'use strict';
const fs = require('fs'),
  _ = require('lodash'),
  request = require('supertest'),
  app = require('../lib/server/server'),
  chai = require('chai'),
  eyes = require('eyes'),
  should = chai.should();

const q1ResultFile = fs.readFileSync(
  `${__dirname}/../fixtures/examples/projection/q1.json`, 'utf-8'),
  q2ResultFile = fs.readFileSync(
    `${__dirname}/../fixtures/examples/projection/q2.json`, 'utf-8'),
  q3ResultFile = fs.readFileSync(
    `${__dirname}/../fixtures/examples/projection/q3.json`, 'utf-8'),
  q4ResultFile = fs.readFileSync(
    `${__dirname}/../fixtures/examples/projection/q4.json`, 'utf-8'),
  q5ResultFile = fs.readFileSync(
    `${__dirname}/../fixtures/examples/projection/q5.json`, 'utf-8');

describe('Query Projection', function (done) {
  this.timeout(0);

  it('q1: it should search for apps by matching text ' +
      'wildcards and returning their permissions and the text value of ' +
      'their buttons using the $ symbol. Three apps must be found.\n',
      function (done) {
        const exampleQuery = 'MATCH app\n' +
                'WHERE\n' +
                '<uses-permission android:name = "(android.permission.READ_*)"/>' +
                '<description>ch*t SMS</description>\n' +
                '<store-category>(*)</store-category>\n' +
                '<Button android:text="(*)"></Button>\n' +
                'RETURN app, $1, $2, $3',
          expectedResult = JSON.parse(q1ResultFile);
        request(app)
            .get('/q')
            .query({ queryText: exampleQuery })
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
              should.not.exist(err);
              should.exist(res.body);
              res.body.should.have.length(3);
              try {
                res.body.should.deep.include.members(expectedResult);
              }
              catch (e) {
                console.log('Expected:');
                eyes.inspect(expectedResult);
                console.log('Actual:');
                eyes.inspect(res.body);
                throw e;
              }
              done();
            });
      });

  it('q2: it should search for apps by matching '+
    'wildcards and return the results using name aliases. '+
    'It must find 4 apps\n',
    function (done) {
      const exampleQuery = 'MATCH app\n' +
                'WHERE\n' +
                '<uses-permission android:name="(android.permission.ACCESS_*)"/>\n' +
                '<developer>Facebook</developer>\n' +
                '<title>(*)</title>\n' +
                '<Button android:text="(*)"></Button>\n' +
                'RETURN app, m$1 as permissions, l$1 as title, u$1 as buttonText',
        expectedResult = JSON.parse(q2ResultFile);
      request(app)
        .get('/q')
        .query({ queryText: exampleQuery })
        .set('Accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res.body);
          res.body.should.have.length(4);
          try {
            res.body.should.deep.include.members(expectedResult);
          }
          catch (e) {
            console.log('Expected:');
            eyes.inspect(expectedResult);
            console.log('Actual:');
            eyes.inspect(res.body);
            throw e;
          }
          done();
        });
    });

  it('q3: it should search for apps with the ACCESS_FINE_LOCATION ' +
    'and return the latest app version. \n', (done) => {
    const exampleQuery = 'MATCH app(latest=true)\n' +
          'WHERE\n' +
          '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>\n' +
          'RETURN app',
      expectedResult = JSON.parse(q3ResultFile);
    request(app)
      .get('/q')
      .query({ queryText: exampleQuery })
      .set('Accept', 'application/json')
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        should.exist(res.body);
        console.log('actual=', _.map(res.body, (val, key) => { return val.app.id;} ));
        res.body.should.have.length(15);
        try {
          res.body.should.deep.include.members(expectedResult);
        }
        catch (e) {
          console.log('Expected:');
          eyes.inspect(expectedResult);
          console.log('Actual:');
          eyes.inspect(res.body);
          throw e;
        }
        done();
      });
  });

  it('q4: it should return all store categories \n', (done) => {
    const exampleQuery = 'MATCH app\nWHERE\n' +
                         '<store-category>(*)</store-category>"\n' +
                         'RETURN app, $1',
      expectedResult = JSON.parse(q4ResultFile);
    request(app)
      .get('/q')
      .query({ queryText: exampleQuery })
      .set('Accept', 'application/json')
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        should.exist(res.body);
        res.body.should.have.length(57);
        try {
            res.body.should.deep.include.members(expectedResult);
        }
        catch (e) {
          console.log('Expected:');
          eyes.inspect(expectedResult);
          console.log('Actual:');
          eyes.inspect(res.body);
          throw e;
        }
        done();
      });
  });

  it('q5: it should find apps whose title contain the word Google and return the ' +
     'latest app version. \n', (done) => {
    const exampleQuery = 'MATCH app(latest=true)\nWHERE\n' +
                      '<title>Google</title>"\n' +
                      'RETURN app',
      expectedResult = JSON.parse(q5ResultFile);
    request(app)
      .get('/q')
      .query({ queryText: exampleQuery })
      .set('Accept', 'application/json')
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        should.exist(res.body);
        res.body.should.have.length(8);
        try {
          res.body.should.deep.include.members(expectedResult);
        }
        catch (e) {
          console.log('Expected:');
          eyes.inspect(expectedResult);
          console.log('Actual:');
          eyes.inspect(res.body);
          throw e;
        }
        done();
      });
  });

  it('q6: It should search for the latest version of the Google Music app ' +
     'that uses the AdMob class "com.google.android.gms.ads"\n' +
     'and find one app version.', function (done) {
    const codeQuery =
        '<code class="com.google.android.gms.ads" />\n',
      q = 'MATCH app(package=com.google.android.music, latest=true)' +
          ` \nWHERE\n${codeQuery}\nRETURN app`,
      expected = [{
        id: 'com.google.android.music-1514',
        packageName: 'com.google.android.music',
        version: '1514'
      }];
    request(app)
      .get('/q')
      .query({ queryText: q })
      .set('Accept', 'application/json')
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        should.exist(res.body);
        try {
          res.body.should.have.length(1);
          const apps = _.map(res.body, 'app');
          apps.should.deep.include.members(expected);
        }
        catch (e) {
          console.log('Expected:');
          eyes.inspect(expected);
          console.log('Actual:');
          eyes.inspect(res.body);
          throw e;
        }
        done();
      });
  });
});
