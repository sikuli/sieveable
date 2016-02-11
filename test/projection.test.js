'use strict';
const fs = require('fs'),
  _ = require('lodash'),
  request = require('supertest'),
  parse = require('../lib/parse.js'),
  app = require('../lib/server/server'),
  chai = require('chai'),
  pd = require('pretty-data').pd,
  eyes = require('eyes'),
  should = chai.should();

const result_json_q1 = fs.readFileSync(__dirname +
    '/../fixtures/examples/projection/q1.json', 'utf-8'),
result_json_q2 = fs.readFileSync(__dirname +
    '/../fixtures/examples/projection/q2.json', 'utf-8'),
result_json_q3 = fs.readFileSync(__dirname +
    '/../fixtures/examples/projection/q3.json', 'utf-8'),
result_json_q4 = fs.readFileSync(__dirname +
    '/../fixtures/examples/projection/q4.json', 'utf-8'),
result_json_q5 = fs.readFileSync(__dirname +
    '/../fixtures/examples/projection/q5.json', 'utf-8');

describe('Query Projection', function (done) {
    this.timeout(0);

    it('q1: it should search for apps by matching text ' +
        'wildcards and returning their permissions and the text value of ' +
        'their buttons using the $ symbol. Three apps must be found.\n',
        function (done) {
            var exampleQuery = 'MATCH app\n' +
                'WHERE\n' +
                '<uses-permission android:name = "(android.permission.READ_*)"/>' +
                '<description>ch*t SMS</description>\n' +
                '<store-category>(*)</store-category>\n' +
                '<Button android:text="(*)"></Button>\n' +
                'RETURN app, $1, $2, $3';
            var expectedResult = JSON.parse(result_json_q1);
            request(app)
                .get('/q')
                .query({queryText: exampleQuery})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    should.exist(res.body);
                    console.log(res.body);
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
            var exampleQuery = 'MATCH app\n' +
                'WHERE\n' +
                '<uses-permission android:name="(android.permission.ACCESS_*)"/>\n' +
                '<developer>Facebook</developer>\n' +
                '<title>(*)</title>\n' +
                '<Button android:text="(*)"></Button>\n' +
                'RETURN app, m$1 as permissions, l$1 as title, u$1 as buttonText';
            var expectedResult = JSON.parse(result_json_q2);
            request(app)
                .get('/q')
                .query({queryText: exampleQuery})
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
          var exampleQuery = 'MATCH app.latest\n' +
                    'WHERE\n' +
                    '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>\n' +
                    'RETURN app';
                var expectedResult = JSON.parse(result_json_q3);
                request(app)
                    .get('/q')
                    .query({queryText: exampleQuery})
                    .set('Accept', 'application/json')
                    .expect(200)
                    .end(function (err, res) {
                        should.not.exist(err);
                        should.exist(res.body);
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
      var exampleQuery = 'MATCH app\n' +
                         'WHERE\n' +
                          '<store-category>(*)</store-category>"\n' +
                          'RETURN app, $1';
      var expectedResult = JSON.parse(result_json_q4);
      request(app)
        .get('/q')
        .query({queryText: exampleQuery})
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
  var exampleQuery = 'MATCH app.latest\n' +
                     'WHERE\n' +
                      '<title>Google</title>"\n' +
                      'RETURN app';
  var expectedResult = JSON.parse(result_json_q5);
  request(app)
    .get('/q')
    .query({queryText: exampleQuery})
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

})
