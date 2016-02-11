'use strict';
const fs = require('fs'),
  _ = require('lodash'),
  config = require('config'),
  request = require('supertest'),
  parse = require('../lib/parse.js'),
  app = require('../lib/server/server'),
  chai = require('chai'),
  eyes = require('eyes'),
  should = chai.should();

var result_json_q1 = fs.readFileSync(__dirname +
    '/../fixtures/examples/manifest/q1.json', 'utf-8');
var result_json_q2 = fs.readFileSync(__dirname +
    '/../fixtures/examples/manifest/q2.json', 'utf-8');
var result_json_q3 = fs.readFileSync(__dirname +
    '/../fixtures/examples/manifest/q3.json', 'utf-8');

describe('Manifest Examples: Answers to multiple manifest by example questions.', function () {
    this.timeout(0);
    it('Manifest q1 It should search for apps that use android.permission.CAMERA\n' +
        'and find 29 apps.',
        function (done) {
            var manifest_query = '<uses-permission android:name="android.permission.CAMERA"/>';
            var q = 'MATCH app\nWHERE\n' + manifest_query + '\nRETURN app';
            var expected = JSON.parse(result_json_q1);
            var apps;
            request(app)
                .get('/q')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.have.length(29);
                    try {
                        apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected);
                        console.log('Actual:');
                        eyes.inspect(res.body);
                        throw e
                    }
                    done()
                });
        });

    it('q2 It should search for apps that request 20 permissions\n' +
        'and find 33 apps.',
        function (done) {
            var manifest_query = fs.readFileSync(__dirname +
                '/../fixtures/examples/manifest/q2.xml', 'utf8');
            var q = 'MATCH app\nWHERE\n' + manifest_query + '\nRETURN app';
            var expected = JSON.parse(result_json_q2);
            var apps;
            request(app)
                .get('/q')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.have.length(33);
                    try {
                        apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected);
                        console.log('Actual:');
                        eyes.inspect(apps);
                        throw e
                    }
                    done()
                });
        });

    it('q3 It should search for apps that request 3 permissions\n' +
        'BLUETOOTH, RECORD_AUDIO, and INTERNET ' +
        'and find 33 apps.',
        function (done) {
            var manifest_query = fs.readFileSync(__dirname +
                '/../fixtures/examples/manifest/q3.xml', 'utf8');
            var q = 'MATCH app\nWHERE\n' + manifest_query + '\nRETURN app';
            var expected = JSON.parse(result_json_q3);
            var apps;
            request(app)
                .get('/q')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.have.length(12);
                    try {
                        apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected);
                        console.log('Actual:');
                        eyes.inspect(apps);
                        throw e
                    }
                    done()
                });
        });

    it('q4 it should search for the following example: \n' +
        '<uses-permission/>\nand returns a number of apps equal to the limit ' +
        'defined in the config file (' + config.get('results.maxManifest') + ')', (done) => {
          const q = 'MATCH app\nWHERE <uses-permission/>\n RETURN app';
          let apps = {};
          request(app)
              .get('/q')
              .query({ queryText: q })
              .set('Accept', 'application/json')
              .expect(200)
              .end((err, res) => {
                should.not.exist(err);
                should.exist(res.body);
                res.body.should.be.an('array', 'Response body is not an array');
                res.body.should.have.length(config.get('results.maxManifest'));
                done();
              });
    });

    // TODO: test for __excatly
    // it('q4 It should search for apps that request exactly 11 permissions\n' +
    //     'and find 33 apps.',
    //     function (done) {
    //         var manifest_query = fs.readFileSync(__dirname +
    //             '/../fixtures/examples/manifest/q4.xml', 'utf8');
    //         var q = 'MATCH app\nWHERE\n' + manifest_query + '\nRETURN app';
    //         var expected = JSON.parse(result_json_q3);
    //         var apps;
    //         request(app)
    //             .get('/q')
    //             .query({ queryText: q })
    //             .set('Accept', 'application/json')
    //             .expect(200)
    //             .end((err, res) => {
    //                 should.not.exist(err);
    //                 should.exist(res.body);
    //                 res.body.should.have.length(12);
    //                 try {
    //                     apps = _.pluck(res.body, 'app');
    //                     apps.should.deep.include.members(expected);
    //                 }
    //                 catch (e) {
    //                     console.log('Expected:');
    //                     eyes.inspect(expected);
    //                     console.log('Actual:');
    //                     eyes.inspect(apps);
    //                     throw e;
    //                 }
    //                 done();
    //             });
    //     });

});
