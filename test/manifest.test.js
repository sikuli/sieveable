var fs = require('fs');
var request = require('supertest');
var parse = require('../lib/parse.js');
var app = require('../lib/server/server');
var chai = require("chai");
var eyes = require('eyes');
var should = chai.should();

var result_json_q1 = fs.readFileSync(__dirname +
    '/../fixtures/examples/manifest/q1.json', 'utf-8');
var result_json_q2 = fs.readFileSync(__dirname +
    '/../fixtures/examples/manifest/q2.json', 'utf-8');
var result_json_q3 = fs.readFileSync(__dirname +
    '/../fixtures/examples/manifest/q3.json', 'utf-8');

describe('Manifest Examples: Answers to multiple manifest by example questions.', function () {
    this.timeout(0)
    it('Manifest q1 It should search for apps that use android.permission.CAMERA\n' +
        'and find 29 apps.',
        function (done) {
            var manifest_query = '<uses-permission android:name="android.permission.CAMERA"/>'
            var q = 'MATCH app\nWHERE\n' + manifest_query + '\nRETURN app';
            var expected = JSON.parse(result_json_q1);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body);
                    res.body.should.have.length(29);
                    try {
                        res.body.should.deep.include.members(expected)
                    }
                    catch (e) {
                        console.log('Expected:')
                        eyes.inspect(expected)
                        console.log('Actual:')
                        eyes.inspect(res.body)
                        throw e
                    }
                    done()
                });
        })

    it('q2 It should search for apps that request 20 permissions\n' +
        'and find 33 apps.',
        function (done) {
            var manifest_query = fs.readFileSync(__dirname +
                '/../fixtures/examples/manifest/q2.xml', 'utf8');
            var q = 'MATCH app\nWHERE\n' + manifest_query + '\nRETURN app';
            var expected = JSON.parse(result_json_q2);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body);
                    res.body.should.have.length(33);
                    try {
                        res.body.should.deep.include.members(expected)
                    }
                    catch (e) {
                        console.log('Expected:')
                        eyes.inspect(expected)
                        console.log('Actual:')
                        eyes.inspect(res.body)
                        throw e
                    }
                    done()
                });
        })

    it('q3 It should search for apps that request 3 permissions\n' +
        'BLUETOOTH, RECORD_AUDIO, and INTERNET ' +
        'and find 33 apps.',
        function (done) {
            var manifest_query = fs.readFileSync(__dirname +
                '/../fixtures/examples/manifest/q3.xml', 'utf8');
            var q = 'MATCH app\nWHERE\n' + manifest_query + '\nRETURN app';
            var expected = JSON.parse(result_json_q3);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body);
                    res.body.should.have.length(12);
                    try {
                        res.body.should.deep.include.members(expected)
                    }
                    catch (e) {
                        console.log('Expected:')
                        eyes.inspect(expected)
                        console.log('Actual:')
                        eyes.inspect(res.body)
                        throw e
                    }
                    done()
                });
        })

})
