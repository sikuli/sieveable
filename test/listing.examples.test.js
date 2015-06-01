var fs = require('fs');
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

    it('q1: It should search for the Google+ app by its title' +
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
                        res.body.should.deep.include.members(expected);
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
                        res.body.should.deep.include.members(expected);
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