var fs = require('fs');
var _ = require('lodash');
var request = require('supertest');
var parse = require('../lib/parse.js');
var app = require('../lib/server/server');
var chai = require("chai");
var pd = require('pretty-data').pd;
var eyes = require('eyes');
var should = chai.should();

var result_json_q1 = fs.readFileSync(__dirname +
    '/../fixtures/examples/projection/q1.json', 'utf-8');
var result_json_q2 = fs.readFileSync(__dirname +
    '/../fixtures/examples/projection/q2.json', 'utf-8');

describe('Query Projection', function (done) {
    this.timeout(0);

    it('q1: it should search for apps by matching text ' +
        'wildcards and returning their permissions and the text value of ' +
        'their buttons using the $ symbol. 10 apps must be found.\n',
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
                .get('/q/json')
                .query({queryText: exampleQuery})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.have.length(6);
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
                .get('/q/json')
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
})
