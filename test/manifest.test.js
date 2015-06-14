var fs = require('fs');
var request = require('supertest');
var parse = require('../lib/parse.js');
var app = require('../lib/server/server');
var chai = require("chai");
var eyes = require('eyes');
var should = chai.should();

var result_json_q1 = fs.readFileSync(__dirname +
'/../fixtures/examples/manifest/q1.json', 'utf-8');

describe('Manifest Examples: Answers to multiple manifest by example questions.', function () {
    this.timeout(20000)
    it('q1 It should search for apps that use android.permission.CAMERA\n' +
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

})
