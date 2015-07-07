var fs = require('fs');
var _ = require("lodash");
var request = require('supertest');
var parse = require('../lib/parse.js');
var app = require('../lib/server/server');
var chai = require("chai");
var eyes = require('eyes');
var should = chai.should();

describe('Listing Details Examples: Answers to multiple listing details by example questions.', function () {
    this.timeout(0)

    var result_json_q1 = fs.readFileSync(__dirname +
        '/../fixtures/examples/listing/q1.json', 'utf-8');
    var result_json_q2 = fs.readFileSync(__dirname +
        '/../fixtures/examples/listing/q2.json', 'utf-8');
    var result_json_q3 = fs.readFileSync(__dirname +
        '/../fixtures/examples/listing/q3.json', 'utf-8');
    var result_json_q4 = fs.readFileSync(__dirname +
        '/../fixtures/examples/listing/q4.json', 'utf-8');

    it('q1: It should search for the Google+ app by its title ' +
        'and find two versions of the app: "413076433" and "413148638".',
        function (done) {
            var listing_query = '<title>Google+</title>'
            var q = 'MATCH app\nWHERE\n' + listing_query + '\n RETURN app';
            var expected = JSON.parse(result_json_q1);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.have.length(2);
                    try {
                        var apps = _.pluck(res.body, 'app');
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
        })

    it('q2: It should search for apps with downloads count between of 500,000,000' +
        ' and 1,000,000,000 and find 13 apps.',
        function (done) {
            var listing_query = '<downloads-count-text>500,000,000 - 1,000,000,000</downloads-count-text>'
            var q = 'MATCH app\nWHERE\n' + listing_query + '\n RETURN app';
            var expected = JSON.parse(result_json_q2);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.have.length(13);
                    try {
                        var apps = _.pluck(res.body, 'app');
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
        })

    it('q3: It should search for apps with the word PDF ' +
        'in their listing details using the full text index ' +
        'and find 2 apps.',
        function (done) {
            var listing_query = '<listing-details>PDF</listing-details>'
            var q = 'MATCH app\nWHERE\n' + listing_query + '\n RETURN app';
            var expected = JSON.parse(result_json_q3);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.have.length(2);
                    try {
                        var apps = _.pluck(res.body, 'app');
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
        })

    it('q4: It should search for apps by providing multiple listing details ' +
        'fields using the full text index along with absolute values search.',
        function (done) {
            var listing_query = '<description>Hats and Eyeglasses</description>'
                + '<price>Free</price>'
                + '<store-category>Casual</store-category>';
            var q = 'MATCH app\nWHERE\n' + listing_query + '\n RETURN app';
            var expected = JSON.parse(result_json_q4);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.have.length(1);
                    try {
                        var apps = _.pluck(res.body, 'app');
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
        })

})