var fs = require('fs');
var request = require('supertest');
var parse = require('../lib/parse.js');
var app = require('../lib/server/server');
var chai = require("chai");
var should = chai.should();
var eyes = require('eyes');
chai.use(require('chai-things'));


describe('Code Examples: Answers to multiple code by example questions.', function () {
    this.timeout(0)

    it('It should search for apps that use the API call ' +
    'android.hardware.CAMERA.takePicture\n' +
    'and find 8 apps two of which are ' +
    '"com.google.android.apps.translate" version: "48364"\n' +
    'and "com.whatsapp" version: "30000023"', function (done) {
        var code_query =
            '<code class="android.hardware.Camera" method ="takePicture" />\n' +
            '<code class="android.hardware.Camera" method ="startPreview" />'
        var q = 'MATCH app\nWHERE\n' + code_query + '\nRETURN app';
        var expected = [
            {
                id: "com.google.android.apps.translate-30000023",
                packageName: "com.google.android.apps.translate",
                version: "30000023"
            },
            {
                id: "com.whatsapp-48364",
                packageName: "com.whatsapp",
                version: "48364"
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
                res.body.should.have.length(7)
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
