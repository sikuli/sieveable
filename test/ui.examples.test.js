var fs = require('fs');
var request = require('supertest');
var parse = require('../lib/parse.js');
var app = require('../lib/server/server');
var chai = require("chai");
var pd = require('pretty-data').pd;
var eyes = require('eyes');
var should = chai.should();

describe('UI Examples: Answers to multiple UI design by example questions.', function () {
    this.timeout(20000)

    var query_xml_q1_a = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q1-a.xml', 'utf-8');
    var result_json_q1_a = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q1-a.json', 'utf-8');

    var query_xml_q1_b = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q1-b.xml', 'utf-8');
    var result_json_q1_b = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q1-b.json', 'utf-8');

    var query_xml_q1_c = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q1-c.xml', 'utf-8');
    var result_json_q1_c = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q1-c.json', 'utf-8');

    var query_xml_q2 = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q2.xml', 'utf-8');
    var result_json_q2 = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q2.json', 'utf-8');

    var query_xml_q3_a = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q3-a.xml', 'utf-8');
    var result_json_q3_a = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q3-a.json', 'utf-8');

    var query_xml_q3_b = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q3-b.xml', 'utf-8');
    var result_json_q3_b = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q3-b.json', 'utf-8');

    var query_xml_q4 = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q4.xml', 'utf-8');
    var result_json_q4 = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q4.json', 'utf-8');

    var query_xml_q5_a = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q5-a.xml', 'utf-8');
    var result_json_q5_a = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q5-a.json', 'utf-8');

    var query_xml_q5_b = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q5-b.xml', 'utf-8');
    var result_json_q5_b = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q5-b.json', 'utf-8');

    var query_xml_q6 = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q6.xml', 'utf-8');
    var result_json_q6 = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q6.json', 'utf-8');

    var query_xml_q7 = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q7.xml', 'utf-8');
    var result_json_q7 = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q7.json', 'utf-8');

    var query_xml_q8 = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q8.xml', 'utf-8');
    var result_json_q8 = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q8.json', 'utf-8');

    var query_xml_q9 = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q9.xml', 'utf-8');
    var result_json_q9 = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q9.json', 'utf-8');

    var query_xml_q10 = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q10.xml', 'utf-8');
    var result_json_q10 = fs.readFileSync(__dirname +
    '/../fixtures/examples/ui/q10.json', 'utf-8');

    this.timeout(0);

    it('q1-a it should search for the following example: \n' +
        pd.xml(query_xml_q1_a) + '\n' +
        'and find two versions of "com.whatsapp", version: "48364" and "48450"',
        function (done) {
            var q = 'MATCH app\nWHERE ' + query_xml_q1_a + '\n RETURN app';
            var expected_q1_a = JSON.parse(result_json_q1_a);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    try {
                        res.body.should.deep.include.members(expected_q1_a);
                    }
                    catch (e) {
                        console.log('Expected:')
                        eyes.inspect(expected_q1_a)
                        console.log('Actual:')
                        eyes.inspect(res.body)
                        throw e
                    }
                    done()
                });
        })

    it('q1-b it should search for the following example: \n' +
        pd.xml(query_xml_q1_b) + '\n' +
        'and find two versions of "com.whatsapp", version: "48364" and "48450"',
        function (done) {
            var q = 'MATCH app\nWHERE ' + query_xml_q1_b + '\n RETURN app';
            var expected_q1_b = JSON.parse(result_json_q1_b);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(2)
                    try {
                        res.body.should.deep.include.members(expected_q1_b);
                    }
                    catch (e) {
                        console.log('Expected:')
                        eyes.inspect(expected_q1_b)
                        console.log('Actual:')
                        eyes.inspect(res.body)
                        throw e
                    }
                    done()
                });
        })

    it('q1-c it should search for the following example: \n' +
        pd.xml(query_xml_q1_c) + '\n' +
        'and find only one version of com.whatsapp, version: 48450',
        function (done) {
            var q = 'MATCH app\nWHERE ' + query_xml_q1_c + '\n RETURN app';
            var expected_q1_c = JSON.parse(result_json_q1_c);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(1)
                    try {
                        res.body.should.deep.include.members(expected_q1_c)
                    }
                    catch (e) {
                        console.log('Expected:')
                        eyes.inspect(expected_q1_c)
                        console.log('Actual:')
                        eyes.inspect(res.body)
                        throw e
                    }
                    done()
                });
        })

    it('q2 it should search for the following example: \n' +
        pd.xml(query_xml_q2) + '\n' +
        'and find 13 apps.',
        function (done) {
            var q = 'MATCH app\nWHERE ' + query_xml_q2 + '\n RETURN app';
            var expected_q2 = JSON.parse(result_json_q2);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(13)
                    try {
                        res.body.should.deep.include.members(expected_q2);
                    }
                    catch (e) {
                        console.log('Expected:')
                        eyes.inspect(expected_q2)
                        console.log('Actual:')
                        eyes.inspect(res.body)
                        throw e
                    }
                    done()
                });
        })

    it('q3-a it should search for the following example: \n' +
        pd.xml(query_xml_q3_a) + '\n' + 'and find 4 apps.',
        function (done) {
            var q = 'MATCH app\nWHERE ' + query_xml_q3_a + '\n RETURN app';
            var expected_q3_a = JSON.parse(result_json_q3_a);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(4)
                    try {
                        res.body.should.deep.include.members(expected_q3_a);
                    }
                    catch (e) {
                        console.log('Expected:')
                        eyes.inspect(expected_q3_a)
                        console.log('Actual:')
                        eyes.inspect(res.body)
                        throw e
                    }
                    done()
                });
        })

    it('q3-b it should search for the following example: \n' +
        pd.xml(query_xml_q3_b) + '\n' +
        'and find 3 apps.',
        function (done) {
            pd.xml(query_xml_q3_b)
            var q = 'MATCH app\nWHERE ' + query_xml_q3_b + '\n RETURN app';
            var expected_q3_b = JSON.parse(result_json_q3_b);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(3)
                    try {
                        res.body.should.deep.include.members(expected_q3_b);
                    }
                    catch (e) {
                        console.log('Expected:')
                        eyes.inspect(expected_q3_b)
                        console.log('Actual:')
                        eyes.inspect(res.body)
                        throw e
                    }
                    done()
                });
        }
    )

    it('q4 it should search for the following example: \n' +
        pd.xml(query_xml_q4) + '\n' +
        'and find 9 apps.',
        function (done) {
            var q = 'MATCH app\nWHERE ' + query_xml_q4 + '\n RETURN app';
            var expected_q4 = JSON.parse(result_json_q4);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(9)
                    try {
                        res.body.should.include.to.deep.equals(expected_q4);
                    }
                    catch (e) {
                        console.log('Expected:')
                        eyes.inspect(expected_q4)
                        console.log('Actual:')
                        eyes.inspect(res.body)
                        throw e
                    }
                    done()
                });
        })

    it('q5-a it should search for the following example: \n' +
        pd.xml(query_xml_q5_a) + '\n' +
        'and find 24 apps.',
        function (done) {
            var q = 'MATCH App\nWHERE ' + query_xml_q5_a + '\n RETURN app';
            var expected_q5_a = JSON.parse(result_json_q5_a);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(24)
                    try {
                        res.body.should.deep.include.members(expected_q5_a);
                    }
                    catch (e) {
                        console.log('Expected:')
                        eyes.inspect(expected_q5_a)
                        console.log('Actual:')
                        eyes.inspect(res.body)
                        throw e
                    }
                    done()
                });
        })

    it('q5-b it should search for the following example: \n' +
        pd.xml(query_xml_q5_b) + '\n' +
        'and find 12 apps:\n' +
        ' "com.facebook.orca, version: 936981"\n' +
        ' "com.sec.chaton , versions: 302115000"\n' +
        ' "com.sec.chaton , version: 207103000"\n' +
        ' "com.tencent.mm, version: 405"',
        function (done) {
            var q = 'MATCH App\nWHERE ' + query_xml_q5_b + '\n RETURN app';
            var expected_q5_b = JSON.parse(result_json_q5_b);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(12)
                    try {
                        res.body.should.deep.include.members(expected_q5_b);
                    }
                    catch (e) {
                        console.log('Expected:')
                        eyes.inspect(expected_q5_b)
                        console.log('Actual:')
                        eyes.inspect(res.body)
                        throw e
                    }
                    done()
                });
        })

    it('q6 it should search for the following example: \n' +
        pd.xml(query_xml_q6) + '\n' +
        'and find 32 apps.',
        function (done) {
            var q = 'MATCH app\nWHERE ' + query_xml_q6 + '\n RETURN app';
            var expected_q6 = JSON.parse(result_json_q6);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(32)
                    try {
                        res.body.should.deep.include.members(expected_q6);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected_q6);
                        console.log('Actual:');
                        eyes.inspect(res.body);
                        throw e
                    }
                    done()
                });
        })

    it('q7 it should search for the following example: \n' +
        pd.xml(query_xml_q7) + '\n' +
        'and find 9 apps.',
        function (done) {
            var q = 'MATCH app\nWHERE ' + query_xml_q7 + '\n RETURN app';
            var expected_q7 = JSON.parse(result_json_q7);
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(9)
                    try {
                        res.body.should.deep.include.members(expected_q7)
                    }
                    catch (e) {
                        console.log('Expected:')
                        eyes.inspect(expected_q7)
                        console.log('Actual:')
                        eyes.inspect(res.body)
                        throw e
                    }
                    done()
                });
        })

    it('q8 it should search for the following example: \n' +
        pd.xml(query_xml_q8) + '\n' +
        'and find 1 app: "com.google.android.youtube, version: 5738."\n',
        function (done) {
            var q = 'MATCH app\nWHERE ' + query_xml_q8 + '\n RETURN app';
            var expected_q8 = JSON.parse(result_json_q8);
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
                        res.body.should.deep.include.members(expected_q8);
                    }
                    catch (e) {
                        console.log('Expected:')
                        eyes.inspect(expected_q8)
                        console.log('Actual:')
                        eyes.inspect(res.body)
                        throw e
                    }
                    done()
                });
        })

})