var fs = require('fs');
var request = require('supertest');
var parse = require('../lib/parse.js');
var app = require('../lib/server/server');
var should = require('should');
var chai = require("chai");
var pd = require('pretty-data').pd;
var eyes = require('eyes');

chai.use(require('chai-things'));
chai.should();

//TODO: Validate results manually.
describe('UI Examples: Answers to multiple UI design by example questions.', function () {
    this.timeout(20000)

    var query_xml_q1_a = fs.readFileSync(__dirname +
    '/../examples/ui/q1-a.xml', 'utf-8');
    var query_xml_q1_b = fs.readFileSync(__dirname +
    '/../examples/ui/q1-b.xml', 'utf-8');
    var query_xml_q2 = fs.readFileSync(__dirname +
    '/../examples/ui/q2.xml', 'utf-8');
    var query_xml_q3_a = fs.readFileSync(__dirname +
    '/../examples/ui/q3-a.xml', 'utf-8');
    var query_xml_q3_b = fs.readFileSync(__dirname +
    '/../examples/ui/q3-b.xml', 'utf-8');
    var query_xml_q4 = fs.readFileSync(__dirname +
    '/../examples/ui/q4.xml', 'utf-8');
    var query_xml_q5_a = fs.readFileSync(__dirname +
    '/../examples/ui/q5-a.xml', 'utf-8');
    var query_xml_q5_b = fs.readFileSync(__dirname +
    '/../examples/ui/q5-b.xml', 'utf-8');
    var query_xml_q6 = fs.readFileSync(__dirname +
    '/../examples/ui/q6.xml', 'utf-8');
    var query_xml_q7 = fs.readFileSync(__dirname +
    '/../examples/ui/q7.xml', 'utf-8');
    var query_xml_q8 = fs.readFileSync(__dirname +
    '/../examples/ui/q8.xml', 'utf-8');
    var query_xml_q9 = fs.readFileSync(__dirname +
    '/../examples/ui/q9.xml', 'utf-8');
    var query_xml_q10 = fs.readFileSync(__dirname +
    '/../examples/ui/q10.xml', 'utf-8');
    this.timeout(0);

    it('q1-a it should search for the following example: \n' +
        pd.xml(query_xml_q1_a) + '\n' +
        'and find two versions of "com.whatsapp", version: "48364" and "48450"',
        function (done) {
            var q = 'MATCH app\nWHERE ' + query_xml_q1_a + '\n RETURN app';
            var expected_q1_a = [{
                id: "com.whatsapp-48364",
                packageName: "com.whatsapp",
                version: "48364"
            },
                {
                    id: "com.whatsapp-48450",
                    packageName: "com.whatsapp",
                    version: "48450"
                }]
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    try {
                        res.body.should.include.something.that.deep.equals(expected_q1_a[0])
                        res.body.should.include.something.that.deep.equals(expected_q1_a[1])
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
            var expected_q1_b = [
                {
                    id: "com.whatsapp-48364", packageName: "com.whatsapp",
                    version: "48364"
                },
                {
                    id: "com.whatsapp-48450", packageName: "com.whatsapp",
                    version: "48450"
                }]
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
                        res.body.should.include.something.that.deep.equals(expected_q1_b[0])
                        res.body.should.include.something.that.deep.equals(expected_q1_b[1])
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

    it('q2 it should search for the following example: \n' +
        pd.xml(query_xml_q2) + '\n' +
        'and find 11 apps, two of which are:\n' +
        '"com.google.android.apps.plus, versions: 413076433 and 413148638"',
        function (done) {
            var q = 'MATCH app\nWHERE ' + query_xml_q2 + '\n RETURN app';
            var expected_q2 = [{
                id: "com.google.android.apps.plus-413076433",
                packageName: "com.google.android.apps.plus",
                version: "413076433"
            },
                {
                    id: "com.google.android.apps.plus-413148638",
                    packageName: "com.google.android.apps.plus",
                    version: "413148638"
                }]
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(11)
                    try {
                        res.body.should.include.something.that.deep.equals(expected_q2[0])
                        res.body.should.include.something.that.deep.equals(expected_q2[1])
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
        pd.xml(query_xml_q3_a) + '\n' +
        'and find 4 apps:\n' +
        '"com.google.android.apps.translate, versions: 30000023 and 30000028"\n'
        + '"com.google.android.gm, versions: "4720010 and 4800250"',
        function (done) {
            var q = 'MATCH app\nWHERE ' + query_xml_q3_a + '\n RETURN app';
            var expected_q3_a = [{
                id: "com.google.android.apps.translate-30000023",
                packageName: "com.google.android.apps.translate",
                version: "30000023"
            },
                {
                    id: "com.google.android.apps.translate-30000028",
                    packageName: "com.google.android.apps.translate",
                    version: "30000028"
                },
                {
                    id: "com.google.android.gm-4720010",
                    packageName: "com.google.android.gm", version: "4720010"
                },
                {
                    id: "com.google.android.gm-4800250",
                    packageName: "com.google.android.gm", version: "4800250"
                }]
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
                        res.body.should.include.something.that.deep.equals(expected_q3_a[0])
                        res.body.should.include.something.that.deep.equals(expected_q3_a[1])
                        res.body.should.include.something.that.deep.equals(expected_q3_a[2])
                        res.body.should.include.something.that.deep.equals(expected_q3_a[3])
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
        'and find 3 apps:\n' +
        '"com.google.android.apps.books, version: 20921"\n'
        + '"com.google.android.music, versions: "1317 and 1514"\n',
        function (done) {
            pd.xml(query_xml_q3_b)
            var q = 'MATCH app\nWHERE ' + query_xml_q3_b + '\n RETURN app';
            var expected_q3_b = [{
                id: "com.google.android.apps.books-20921",
                packageName: "com.google.android.apps.books", version: "20921"
            },
                {
                    id: "com.google.android.music-1317",
                    packageName: "com.google.android.music", version: "1317"
                },
                {
                    id: "com.google.android.music-1514",
                    packageName: "com.google.android.music", version: "1514"
                }]
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
                        res.body.should.include.something.that.deep.equals(expected_q3_b[0])
                        res.body.should.include.something.that.deep.equals(expected_q3_b[1])
                        res.body.should.include.something.that.deep.equals(expected_q3_b[2])
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
        'and find 6 app, four of which are:\n' +
        '"com.facebook.katana, version: 666397 and 258882"\n' +
        '"com.instagram.android, version: 639564"\n' +
        '"com.sgiggle.production, version: 1386724633"\n',
        function (done) {
            var q = 'MATCH app\nWHERE ' + query_xml_q4 + '\n RETURN app';
            var expected_q4 = [{
                id: "com.facebook.katana-666397",
                packageName: "com.facebook.katana", version: "666397"
            },
                {
                    id: "com.facebook.katana-258882",
                    packageName: "com.facebook.katana", version: "258882"
                },
                {
                    id: "com.instagram.android-639564",
                    packageName: "com.instagram.android", version: "639564"
                },
                {
                    id: "com.sgiggle.production-1386724633",
                    packageName: "com.sgiggle.production", version: "1386724633"
                }]
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(6)
                    try {
                        res.body.should.include.something.that.deep.equals(expected_q4[0])
                        res.body.should.include.something.that.deep.equals(expected_q4[1])
                        res.body.should.include.something.that.deep.equals(expected_q4[2])
                        res.body.should.include.something.that.deep.equals(expected_q4[3])
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
        'and find 23 apps, four of which are:\n' +
        ' "com.viber.voip-47, version: 47"\n' +
        ' "com.sec.chaton, versions: 207103000"\n' +
        ' "com.android.chrome, version: 1547059"\n' +
        ' "com.whatsapp, version: 48364"',
        function (done) {
            var q = 'MATCH App\nWHERE ' + query_xml_q5_a + '\n RETURN app';
            var expected_q5_a = [{
                id: "com.viber.voip-47",
                packageName: "com.viber.voip", version: "47"
            },
                {
                    id: "com.sec.chaton-207103000",
                    packageName: "com.sec.chaton", version: "207103000"
                },
                {
                    id: "com.android.chrome-1547059",
                    packageName: "com.android.chrome", version: "1547059"
                },
                {
                    id: "com.whatsapp-48364",
                    packageName: "com.whatsapp", version: "48364"
                }]
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(23)
                    try {
                        res.body.should.include.something.that.deep.equals(expected_q5_a[0])
                        res.body.should.include.something.that.deep.equals(expected_q5_a[1])
                        res.body.should.include.something.that.deep.equals(expected_q5_a[2])
                        res.body.should.include.something.that.deep.equals(expected_q5_a[3])
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
            var expected_q5_b = [{
                id: "com.facebook.orca-936981",
                packageName: "com.facebook.orca", version: "936981"
            },
                {
                    id: "com.sec.chaton-302115000",
                    packageName: "com.sec.chaton", version: "302115000"
                },
                {
                    id: "com.sec.chaton-207103000",
                    packageName: "com.sec.chaton", version: "207103000"
                },
                {
                    id: "com.tencent.mm-405",
                    packageName: "com.tencent.mm", version: "405"
                }]
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
                        res.body.should.include.something.that.deep.equals(expected_q5_b[0])
                        res.body.should.include.something.that.deep.equals(expected_q5_b[1])
                        res.body.should.include.something.that.deep.equals(expected_q5_b[2])
                        res.body.should.include.something.that.deep.equals(expected_q5_b[3])
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
        'and find 29 apps, four of which are:\n' +
        ' "com.viber.voip-37, version: 666397"\n' +
        ' "com.sgiggle.production, versions: 68"\n' +
        ' "com.outfit7.talkingtom2free, version: 142"\n' +
        ' "com.google.android.music-1317, version: 48364"',
        function (done) {
            var q = 'MATCH app\nWHERE ' + query_xml_q6 + '\n RETURN app';
            var expected_q6 = [{
                id: "com.viber.voip-37",
                packageName: "com.viber.voip", version: "37"
            },
                {
                    id: "com.sgiggle.production-68",
                    packageName: "com.sgiggle.production", version: "68"
                },
                {
                    id: "com.outfit7.talkingtom2free-142",
                    packageName: "com.outfit7.talkingtom2free", version: "142"
                },
                {
                    id: "com.google.android.music-1317",
                    packageName: "com.google.android.music", version: "1317"
                }]
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(29)
                    try {
                        res.body.should.include.something.that.deep.equals(expected_q6[0])
                        res.body.should.include.something.that.deep.equals(expected_q6[1])
                        res.body.should.include.something.that.deep.equals(expected_q6[2])
                        res.body.should.include.something.that.deep.equals(expected_q6[3])
                    }
                    catch (e) {
                        console.log('Expected:')
                        eyes.inspect(expected_q6)
                        console.log('Actual:')
                        eyes.inspect(res.body)
                        throw e
                    }
                    done()
                });
        })

    it('q7 it should search for the following example: \n' +
        pd.xml(query_xml_q7) + '\n' +
        'and find 9 apps, four of which are:\n' +
        ' "com.android.chrome, version: 1547059"\n' +
        ' "om.sec.chaton, versions: 207103000"\n' +
        ' "com.viber.voip, version: 37"\n' +
        ' "com.viber.voip, version: 47"',
        function (done) {
            var q = 'MATCH app\nWHERE ' + query_xml_q7 + '\n RETURN app';
            var expected_q7 = [{
                id: "com.android.chrome-1547059",
                packageName: "com.android.chrome", version: "1547059"
            },
                {
                    id: "com.sec.chaton-207103000",
                    packageName: "com.sec.chaton", version: "207103000"
                },
                {
                    id: "com.viber.voip-37",
                    packageName: "com.viber.voip", version: "37"
                },
                {
                    id: "com.viber.voip-47",
                    packageName: "com.viber.voip", version: "47"
                }]
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
                        res.body.should.include.something.that.deep.equals(expected_q7[0])
                        res.body.should.include.something.that.deep.equals(expected_q7[1])
                        res.body.should.include.something.that.deep.equals(expected_q7[2])
                        res.body.should.include.something.that.deep.equals(expected_q7[3])
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
            var q = parse(query_xml_q8)
            var expected_q8 = [{
                id: "com.google.android.youtube-5738",
                packageName: "com.google.android.youtube", version: "5738"
            }]
            request(app)
                .get('/q/json')
                .query({queryText: q})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(1)
                    res.body.should.include.something.that.deep.equals(expected_q8[0])
                    done()
                });
        })

})