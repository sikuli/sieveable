var fs = require('fs');
var request = require('supertest');
var parse = require('../lib/parse.js');
var app = require('../lib/server/server');
var chai = require("chai");
var eyes = require('eyes');

chai.use(require('chai-things'));
var should = chai.should();

describe('Manifest Examples: Answers to multiple manifest by example questions.', function () {
    this.timeout(0)

    it('It should search for apps that use android.permission.CAMERA\n' +
        'and find n apps two of which are "com.android.app.snapshotshare" version: "1"\n' +
        'and "com.example.vermilion" version: "1"',
        function (done) {
            var manifest_query = '<uses-permission android:name="android.permission.CAMERA"/>'
            var q = 'MATCH app\nWHERE\n' + manifest_query + '\nRETURN app';
            var expected = [
                {
                    id: "com.android.app.snapshotshare-1",
                    packageName: "com.android.app.snapshotshare",
                    version: "1"
                },
                {
                    id: "com.example.vermilion-1",
                    packageName: "com.example.vermilion",
                    version: "1"
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
