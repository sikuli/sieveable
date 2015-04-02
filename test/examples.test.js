var fs = require('fs'),
    request = require('supertest'),
    parse = require('../lib/parse.js'),
    app = require('../lib/server/server'),
    should = require('should'),
    chai = require("chai");

chai.use(require('chai-things'));
chai.should();

//TODO: Validate results manually.
describe('examples: Answers to multiple design by example questions.', function () {
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
    var query_xml_q5_a = fs.readFileSync(__dirname +
    '/../examples/queries/q5-a.xml', 'utf-8');
    var query_xml_q5_b = fs.readFileSync(__dirname +
    '/../examples/queries/q5-b.xml', 'utf-8');
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
            var listing_query = '{"developer" : "WhatsApp Inc."}'
            var expected_q1_a = [{
                id: 56,
                packageName: "com.whatsapp",
                version: "48364"
            },
                {id: 57, packageName: "com.whatsapp", version: "48450"}]
            request(app)
                .get('/q/json')
                .query({ui: query_xml_q1_a, listing: listing_query})
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
            var listing_query = '{"developer" : "WhatsApp Inc."}'
            var expected_q1_b = [{
                id: 56,
                packageName: "com.whatsapp",
                version: "48364"
            },
                {id: 57, packageName: "com.whatsapp", version: "48450"}]
            request(app)
                .get('/q/json')
                .query({ui: query_xml_q1_b, listing: listing_query})
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
            var listing_query = '{"download" : 500000000}'
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
                .query({ui: query_xml_q2, listing:listing_query})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(6)
                    res.body.should.include.something.that.deep.equals(expected_q2[0])
                    res.body.should.include.something.that.deep.equals(expected_q2[1])
                    done()
                });
        })

    it('q3-a it should search for the given example (' + query_xml_q3_a +
        ' ) and find 4 apps:' +
        '"com.google.android.apps.translate, versions: 30000023 and 30000028"\n'
        + '"com.google.android.gm, versions: "4720010 and 4800250"',
        function (done) {
            var q = parse(query_xml_q3_a);
            var listing_query = '{"developer": "Google Inc."}'
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
                .query({ui: query_xml_q3_a, listing: listing_query})
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

    it('q3-b it should search for the given example (' + query_xml_q3_b +
        ' ) and find 3 apps:' +
        '"com.google.android.apps.books, version: 20921"\n'
        + '"com.google.android.music, versions: "1317 and 1514"\n',
        function (done) {
            var q = parse(query_xml_q3_b);
            var listing_query = '{"download": 100000000}'
            var expected_q3_b = [{
                id: 14, packageName: "com.google.android.apps.books",
                version: "20921"
            },
                {
                    id: 26, packageName: "com.google.android.music",
                    version: "1317"
                },
                {
                    id: 27, packageName: "com.google.android.music",
                    version: "1514"
                }]
            request(app)
                .get('/q/json')
                .query({ui: query_xml_q3_b, listing: listing_query})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(3)
                    res.body.should.include.something.that.deep.equals(expected_q3_b[0])
                    res.body.should.include.something.that.deep.equals(expected_q3_b[1])
                    res.body.should.include.something.that.deep.equals(expected_q3_b[2])
                    done()
                });
        }
    )

    it('q4 it should search for the given example (' + query_xml_q4 +
        ' ) and find 6 app, four of which are:' +
        ' "com.facebook.katana, version: 666397 and 258882"\n' +
        ' "com.instagram.android, version: 639564"\n' +
        ' "com.sgiggle.production, version: 1386724633"\n',
        function (done) {
            var q = parse(query_xml_q4);
            var listing_query = '{"category": "Social"}'
            var expected_q4 = [{
                id: 9, packageName: "com.facebook.katana",
                version: "666397"
            },
                {
                    id: 8, packageName: "com.facebook.katana",
                    version: "258882"
                },
                {
                    id: 36, packageName: "com.instagram.android",
                    version: "639564"
                },
                {
                    id: 46, packageName: "com.sgiggle.production",
                    version: "1386724633"
                }]
            request(app)
                .get('/q/json')
                .query({ui: query_xml_q4, listing: listing_query})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(6)
                    res.body.should.include.something.that.deep.equals(expected_q4[0])
                    res.body.should.include.something.that.deep.equals(expected_q4[1])
                    res.body.should.include.something.that.deep.equals(expected_q4[2])
                    res.body.should.include.something.that.deep.equals(expected_q4[3])
                    done()
                });
        })

    it('q5-a it should search for the given example (' + query_xml_q5_a +
        ' ) and find 10 apps, four of which are:\n' +
        ' "com.viber.voip-47, version: 47"\n' +
        ' "com.sec.chaton, versions: 207103000"\n' +
        ' "com.android.chrome, version: 1547059"\n' +
        ' "com.whatsapp, version: 48364"',
        function (done) {
            var q = parse(query_xml_q5_a);
            var listing_query = '{"category": "Communication"}'
            var expected_q5_a = [{
                id: 55, packageName: "com.viber.voip",
                version: "47"
            },
                {
                    id: 44, packageName: "com.sec.chaton",
                    version: "207103000"
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
                .query({ui: query_xml_q5_a, listing: listing_query})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(10)
                    res.body.should.include.something.that.deep.equals(expected_q5_a[0])
                    res.body.should.include.something.that.deep.equals(expected_q5_a[1])
                    res.body.should.include.something.that.deep.equals(expected_q5_a[2])
                    res.body.should.include.something.that.deep.equals(expected_q5_a[3])
                    done()
                });
        })

    it('q5-b it should search for the given example (' + query_xml_q5_b +
        ' ) and find 4 apps:\n' +
        ' "com.facebook.orca, version: 936981"\n' +
        ' "com.sec.chaton , versions: 302115000"\n' +
        ' "com.sec.chaton , version: 207103000"\n' +
        ' "com.tencent.mm, version: 405"',
        function (done) {
            var q = parse(query_xml_q5_b);
            var listing_query = '{"category": "Communication"}'
            var expected_q5_b = [{
                id: 11, packageName: "com.facebook.orca",
                version: "936981"
            },
                {
                    id: 45, packageName: "com.sec.chaton",
                    version: "302115000"
                },
                {
                    id: 44, packageName: "com.sec.chaton",
                    version: "207103000"
                },
                {
                    id: 53, packageName: "com.tencent.mm",
                    version: "405"
                }]
            request(app)
                .get('/q/json')
                .query({ui: query_xml_q5_b, listing: listing_query})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(4)
                    res.body.should.include.something.that.deep.equals(expected_q5_b[0])
                    res.body.should.include.something.that.deep.equals(expected_q5_b[1])
                    res.body.should.include.something.that.deep.equals(expected_q5_b[2])
                    res.body.should.include.something.that.deep.equals(expected_q5_b[3])
                    done()
                });
        })

    it('q6 it should search for the given example (' + query_xml_q6 +
        ' ) and find 18 apps, four of which are:\n' +
        ' "com.viber.voip-37, version: 666397"\n' +
        ' "com.sgiggle.production, versions: 68"\n' +
        ' "com.outfit7.talkingtom2free, version: 142"\n' +
        ' "com.google.android.music-1317, version: 48364"',
        function (done) {
            var q = parse(query_xml_q6)
            var listing_query = '{"download": 100000000}'

            var expected_q6 = [{
                id: 54, packageName: "com.viber.voip",
                version: "37"
            },
                {
                    id: 47, packageName: "com.sgiggle.production",
                    version: "68"
                },
                {
                    id: 42, packageName: "com.outfit7.talkingtom2free",
                    version: "142"
                },
                {
                    id: 26, packageName: "com.google.android.music",
                    version: "1317"
                }]
            request(app)
                .get('/q/json')
                .query({ui: query_xml_q6, listing: listing_query})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(18)
                    res.body.should.include.something.that.deep.equals(expected_q6[0])
                    res.body.should.include.something.that.deep.equals(expected_q6[1])
                    res.body.should.include.something.that.deep.equals(expected_q6[2])
                    res.body.should.include.something.that.deep.equals(expected_q6[3])
                    done()
                });
        })

    it('q7 it should search for the given example (' + query_xml_q7 +
        ' ) and find 5 apps, four of which are:\n' +
        ' "com.android.chrome, version: 1547059"\n' +
        ' "om.sec.chaton, versions: 207103000"\n' +
        ' "com.viber.voip, version: 37"\n' +
        ' "com.viber.voip, version: 47"',
        function (done) {
            var q = parse(query_xml_q7);
            var listing_query = '{"download": 100000000}'
            var expected_q7 = [{
                id: 2, packageName: "com.android.chrome",
                version: "1547059"
            },
                {
                    id: 44, packageName: "com.sec.chaton",
                    version: "207103000"
                },
                {
                    id: 54,
                    packageName: "com.viber.voip",
                    version: "37"
                },
                {
                    id: 55, packageName: "com.viber.voip",
                    version: "47"
                }]
            request(app)
                .get('/q/json')
                .query({ui: query_xml_q7, listing: listing_query})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err)
                    should.exist(res.body)
                    res.body.should.have.length(5)
                    res.body.should.include.something.that.deep.equals(expected_q7[0])
                    res.body.should.include.something.that.deep.equals(expected_q7[1])
                    res.body.should.include.something.that.deep.equals(expected_q7[2])
                    res.body.should.include.something.that.deep.equals(expected_q7[3])
                    done()
                });
        })

    it('q8 it should search for the given example (' + query_xml_q8 +
        ' ) and find 1 app:\n' +
        ' "com.google.android.youtube, version: 5738."\n',
        function (done) {
            var q = parse(query_xml_q8)
            var listing_query = '{"total_permissions": 16}'
            var expected_q8 = [{
                id: 33, packageName: "com.google.android.youtube",
                version: "5738"
            }]
            request(app)
                .get('/q/json')
                .query({ui: query_xml_q8, listing: listing_query})
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