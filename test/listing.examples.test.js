var fs = require('fs'),
    request = require('supertest'),
    parse = require('../lib/parse.js'),
    app = require('../lib/server/server'),
    should = require('should'),
    chai = require("chai"),
    eyes = require('eyes');

chai.use(require('chai-things'));
chai.should();

//TODO: Validate results manually.
describe('Listing Details Examples: Answers to multiple listing details by example questions.', function () {
    this.timeout(0)


    it('It should search for the Google+ app by its title' +
        'and find two versions of the app: "413076433" and "413148638"',
        function (done) {
            var listing_query = '<title>Google+</title>'
            var q = 'MATCH app\nWHERE\n' + listing_query + '\n RETURN app';
            var expected = [
                {
                    id: "com.google.android.apps.plus-413076433",
                    packageName: "com.google.android.apps.plus",
                    version: "413076433"
                },
                {
                    id: "com.google.android.apps.plus-413148638",
                    packageName: "com.google.android.apps.plus",
                    version: "413148638"
                }
            ]
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    try {
                        res.body.should.include.something.that.deep.equals(expected[0])
                        res.body.should.include.something.that.deep.equals(expected[1])
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

    it('It should search for apps with downloads count between of 500,000,000' +
        'and 1,000,000,000' +
        'and find n apps, two of which are: com.google.android.apps.plus versions:' +
        '"413076433" and "413148638"',
        function (done) {
            var listing_query = '<downloads-count-text>500,000,000 - 1,000,000,000</downloads-count-text>'
            var q = 'MATCH app\nWHERE\n' + listing_query + '\n RETURN app';
            var expected = [
                {
                    id: "com.google.android.apps.plus-413076433",
                    packageName: "com.google.android.apps.plus",
                    version: "413076433"
                },
                {
                    id: "com.google.android.apps.plus-413148638",
                    packageName: "com.google.android.apps.plus",
                    version: "413148638"
                }
            ]
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    try {
                        res.body.should.include.something.that.deep.equals(expected[0])
                        res.body.should.include.something.that.deep.equals(expected[1])
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