var fs = require('fs'),
    request = require('supertest'),
    parse = require('../lib/parse.js'),
    app = require('../lib/server/server'),
    should = require('should'),
    chai = require("chai");

chai.use(require('chai-things'));
chai.should();

//TODO: Validate results manually.
describe('examples: Answers to 10 design by example questions.', function () {
    this.timeout(20000)

    var query_xml_q1_a = fs.readFileSync(__dirname +
    '/../examples/queries/q1-a.xml', 'utf-8');
    var query_xml_q1_b = fs.readFileSync(__dirname +
    '/../examples/queries/q1-b.xml', 'utf-8');
    var query_xml_q2 = fs.readFileSync(__dirname +
    '/../examples/queries/q2.xml', 'utf-8');
    var query_xml_q3_a = fs.readFileSync(__dirname +
    '/../examples/queries/q3-a.xml', 'utf-8');
    var query_xml_q3_b = fs.readFileSync(__dirname +
    '/../examples/queries/q3-b.xml', 'utf-8');
    var query_xml_q4 = fs.readFileSync(__dirname +
    '/../examples/queries/q4.xml', 'utf-8');
    var query_xml_q5 = fs.readFileSync(__dirname +
    '/../examples/queries/q5.xml', 'utf-8');
    var query_xml_q6 = fs.readFileSync(__dirname +
    '/../examples/queries/q6.xml', 'utf-8');
    var query_xml_q7 = fs.readFileSync(__dirname +
    '/../examples/queries/q7.xml', 'utf-8');
    var query_xml_q8 = fs.readFileSync(__dirname +
    '/../examples/queries/q8.xml', 'utf-8');
    var query_xml_q9 = fs.readFileSync(__dirname +
    '/../examples/queries/q9.xml', 'utf-8');
    var query_xml_q10 = fs.readFileSync(__dirname +
    '/../examples/queries/q10.xml', 'utf-8');
    this.timeout(0);

    it('q1-a it should search for the given example (' + query_xml_q1_a +
        ' ) and find two versions of "com.whatsapp", version: "48364" and "48450"',
        function (done) {
            var q = parse(query_xml_q1_a);
            var expected_q1_a = [{
                id: 56,
                packageName: "com.whatsapp",
                version: "48364"
            },
                {id: 57, packageName: "com.whatsapp", version: "48450"}]
            request(app)
                .get('/q/json')
                .query({q: query_xml_q1_a})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.include.something.that.deep.equals(expected_q1_a[0])
                    res.body.should.include.something.that.deep.equals(expected_q1_a[1])
                    done()
                });
        })

    it('q1-b it should search for the given example (' + query_xml_q1_b +
        ' ) and find two versions of "com.whatsapp", version: "48364" and "48450"',
        function (done) {
            var q = parse(query_xml_q1_b);
            var expected_q1_b = [{
                id: 56,
                packageName: "com.whatsapp",
                version: "48364"
            },
                {id: 57, packageName: "com.whatsapp", version: "48450"}]
            request(app)
                .get('/q/json')
                .query({q: query_xml_q1_b})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(2)
                    res.body.should.include.something.that.deep.equals(expected_q1_b[0])
                    res.body.should.include.something.that.deep.equals(expected_q1_b[1])
                    done()
                });
        })

    it('q2 it should search for the given example (' + query_xml_q2 +
        ' ) and find 13 apps, two of which are:' +
        '"com.google.android.apps.plus, versions: 413076433 and 413148638"',
        function (done) {
            var q = parse(query_xml_q2);
            var expected_q2 = [{
                id: 18,
                packageName: "com.google.android.apps.plus",
                version: "413076433"
            },
                {
                    id: 19,
                    packageName: "com.google.android.apps.plus",
                    version: "413148638"
                }]
            request(app)
                .get('/q/json')
                .query({q: query_xml_q2})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(13)
                    res.body.should.include.something.that.deep.equals(expected_q2[0])
                    res.body.should.include.something.that.deep.equals(expected_q2[1])
                    done()
                });
        })

    it('q3-a it should search for the given example (' + query_xml_q3_a +
        ' ) and find 4 apps:' +
        '"com.google.android.apps.translate, versions: 30000023 and 30000028"\n'
        +'"com.google.android.gm, versions: "4720010 and 4800250"',
        function (done) {
            var q = parse(query_xml_q3_a);
            var expected_q3_a = [{
                id: 20, packageName: "com.google.android.apps.translate",
                version: "30000023"
            },
                {
                    id: 21, packageName: "com.google.android.apps.translate",
                    version: "30000028"
                },
                {
                    id: 22, packageName: "com.google.android.gm",
                    version: "4720010"
                },
                {
                    id: 23, packageName: "com.google.android.gm",
                    version: "4800250"
                }]
            request(app)
                .get('/q/json')
                .query({q: query_xml_q3_a})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(4)
                    res.body.should.include.something.that.deep.equals(expected_q3_a[0])
                    res.body.should.include.something.that.deep.equals(expected_q3_a[1])
                    res.body.should.include.something.that.deep.equals(expected_q3_a[2])
                    res.body.should.include.something.that.deep.equals(expected_q3_a[3])
                    done()
                });
        })

    it('q4 it should search for the given example (' + query_xml_q4 +
        ' ) and find 9 apps, four of which are:' +
        ' "com.facebook.katana, version: 666397 and 258882"\n' +
        ' "com.android.chrome, version: 1547059"\n' +
        ' "com.sgiggle.production, version: 1386724633"\n',
        function (done) {
            var q = parse(query_xml_q4);
            var expected_q4 = [{
                id: 9, packageName: "com.facebook.katana",
                version: "666397"
            },
                {
                    id: 8, packageName: "com.facebook.katana",
                    version: "258882"
                },
                {
                    id: 2, packageName: "com.android.chrome",
                    version: "1547059"
                },
                {
                    id: 46, packageName: "com.sgiggle.production",
                    version: "1386724633"
                }]
            request(app)
                .get('/q/json')
                .query({q: query_xml_q4})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(9)
                    res.body.should.include.something.that.deep.equals(expected_q4[0])
                    res.body.should.include.something.that.deep.equals(expected_q4[1])
                    res.body.should.include.something.that.deep.equals(expected_q4[2])
                    res.body.should.include.something.that.deep.equals(expected_q4[3])
                    done()
                });
        })

    it('q5 it should search for the given example (' + query_xml_q5 +
        ' ) and find 24 apps, four of which are:\n' +
        ' "com.facebook.katana, version: 666397"\n' +
        ' "com.tencent.mm, versions: 361"\n' +
        ' "com.android.chrome, version: 1547059"\n' +
        ' "com.whatsapp, version: 48364"',
        function (done) {
            var q = parse(query_xml_q5);
            var expected_q5 = [{
                id: 9, packageName: "com.facebook.katana",
                version: "666397"
            },
                {
                    id: 52, packageName: "com.tencent.mm",
                    version: "361"
                },
                {
                    id: 2, packageName: "com.android.chrome",
                    version: "1547059"
                },
                {
                    id: 56, packageName: "com.whatsapp",
                    version: "48364"
                }]
            request(app)
                .get('/q/json')
                .query({q: query_xml_q5})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(24)
                    res.body.should.include.something.that.deep.equals(expected_q5[0])
                    res.body.should.include.something.that.deep.equals(expected_q5[1])
                    res.body.should.include.something.that.deep.equals(expected_q5[2])
                    res.body.should.include.something.that.deep.equals(expected_q5[3])
                    done()
                });
        })

})