var fs = require('fs');
var _ = require('lodash');
var request = require('supertest');
var parse = require('../lib/parse.js');
var app = require('../lib/server/server');
var chai = require("chai");
var should = chai.should();
var eyes = require('eyes');

describe('Code Examples: Answers to multiple code by example questions.', function () {
    this.timeout(0);

    var result_json_q1 = fs.readFileSync(__dirname +
        '/../fixtures/examples/code/q1.json', 'utf-8');
    var result_json_q2 = fs.readFileSync(__dirname +
        '/../fixtures/examples/code/q2.json', 'utf-8');

    it('q1: It should search for apps that use the API call ' +
        'android.hardware.CAMERA.takePicture\n' +
        'and find 7 apps.', function (done) {
        var code_query =
            '<code class="android.hardware.Camera" method ="takePicture" />\n' +
            '<code class="android.hardware.Camera" method ="startPreview" />'
        var q = 'MATCH app\nWHERE\n' + code_query + '\nRETURN app';
        var expected = JSON.parse(result_json_q1);
        request(app)
            .get('/q')
            .query({queryText: q})
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                should.not.exist(err);
                should.exist(res.body);
                try {
                    res.body.should.have.length(7);
                    var apps = _.map(res.body, 'app');
                    apps.should.deep.include.members(expected);
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

    it('q2: It should search for apps that use the API call ' +
        'com.google.android.gms.location.LocationListener.takePicture\n' +
        'and find 7 apps.', function (done) {
        var code_query =
            '<code class="com.google.android.gms.location.LocationListener" method ="onLocationChanged" />\n';
        var q = 'MATCH app\nWHERE\n' + code_query + '\nRETURN app';
        var expected = JSON.parse(result_json_q2);
        request(app)
            .get('/q')
            .query({queryText: q})
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                should.not.exist(err);
                should.exist(res.body);
                try {
                    res.body.should.have.length(7);
                    var apps = _.map(res.body, 'app');
                    apps.should.deep.include.members(expected);
                }
                catch (e) {
                    console.log('Expected:')
                    eyes.inspect(expected)
                    console.log('Actual:')
                    eyes.inspect(res.body)
                    throw e
                }
                done();
            });
    })

})
