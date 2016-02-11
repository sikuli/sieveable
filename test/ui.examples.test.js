'use strict';
const fs = require('fs'),
    _ = require('lodash'),
    request = require('supertest'),
    app = require('../lib/server/server'),
    chai = require('chai'),
    config = require('config'),
    pd = require('pretty-data').pd,
    eyes = require('eyes'),
    should = chai.should();

describe('UI Examples: Answers to multiple UI design by example questions.', function() {
    this.timeout(40000);

    const query_xml_q1_a = fs.readFileSync(__dirname +
        '/../fixtures/examples/ui/q1-a.xml', 'utf-8'),
        result_json_q1_a = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q1-a.json', 'utf-8'),
        query_xml_q1_b = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q1-b.xml', 'utf-8'),
        result_json_q1_b = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q1-b.json', 'utf-8'),
        query_xml_q1_c = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q1-c.xml', 'utf-8'),
        result_json_q1_c = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q1-c.json', 'utf-8'),
        query_xml_q2 = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q2.xml', 'utf-8'),
        result_json_q2 = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q2.json', 'utf-8'),
        query_xml_q3_a = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q3-a.xml', 'utf-8'),
        result_json_q3_a = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q3-a.json', 'utf-8'),
        query_xml_q3_b = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q3-b.xml', 'utf-8'),
        result_json_q3_b = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q3-b.json', 'utf-8'),
        query_xml_q4 = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q4.xml', 'utf-8'),
        result_json_q4 = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q4.json', 'utf-8'),
        query_xml_q5_a = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q5-a.xml', 'utf-8'),
        result_json_q5_a = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q5-a.json', 'utf-8'),
        query_xml_q5_b = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q5-b.xml', 'utf-8'),
        result_json_q5_b = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q5-b.json', 'utf-8'),
        query_xml_q5_c = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q5-c.xml', 'utf-8'),
        result_json_q5_c = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q5-c.json', 'utf-8'),
        query_xml_q6 = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q6.xml', 'utf-8'),
        result_json_q6 = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q6.json', 'utf-8'),
        query_xml_q7 = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q7.xml', 'utf-8'),
        result_json_q7 = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q7.json', 'utf-8'),
        query_xml_q8 = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q8.xml', 'utf-8'),
        result_json_q8 = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q8.json', 'utf-8'),
        query_xml_q9 = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q9.xml', 'utf-8'),
        result_json_q9 = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q9.json', 'utf-8');
        /* query_xml_q10 = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q10.xml', 'utf-8'),
        result_json_q10 = fs.readFileSync(__dirname +
            '/../fixtures/examples/ui/q10.json', 'utf-8');
        */

    it('q1-a it should search for the following example: \n' +
        pd.xml(query_xml_q1_a) + '\n' +
        'and find two versions of "com.whatsapp", version: "48364" and "48450"',
        (done) => {
            const q = 'MATCH app\nWHERE ' + query_xml_q1_a + '\n RETURN app',
                expected_q1_a = JSON.parse(result_json_q1_a);
            let apps = {};
            request(app)
                .get('/q')
                .query({ queryText: q })
                .set('Accept', 'application/json')
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.be.an('array', 'Response body is not an array');
                    res.body.should.have.length(2);
                    try {
                        apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected_q1_a);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected_q1_a);
                        console.log('Actual:');
                        eyes.inspect(apps);
                        throw e;
                    }
                    done();
                });
        });

    it('q1-b it should search for the following example: \n' +
        pd.xml(query_xml_q1_b) + '\n' +
        'and find two versions of "com.whatsapp", version: "48364" and "48450"',
        (done) => {
            const q = 'MATCH app\nWHERE ' + query_xml_q1_b + '\n RETURN app',
                expected_q1_b = JSON.parse(result_json_q1_b);
            let apps;
            request(app)
                .get('/q')
                .query({ queryText: q })
                .set('Accept', 'application/json')
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.be.an('array', 'Response body is not an array');
                    res.body.should.have.length(2);
                    try {
                        apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected_q1_b);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected_q1_b);
                        console.log('Actual:');
                        eyes.inspect(apps);
                        throw e;
                    }
                    done();
                });
        });

    it('q1-c it should search for the following example: \n' +
        pd.xml(query_xml_q1_c) + '\n' +
        'and find only one version of com.whatsapp, version: 48450',
        (done) => {
            const q = 'MATCH app\nWHERE ' + query_xml_q1_c + '\n RETURN app',
                expected_q1_c = JSON.parse(result_json_q1_c);
            let apps;
            request(app)
                .get('/q')
                .query({ queryText: q })
                .set('Accept', 'application/json')
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.be.an('array', 'Response body is not an array');
                    res.body.should.have.length(1);
                    try {
                        apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected_q1_c);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected_q1_c);
                        console.log('Actual:');
                        eyes.inspect(apps);
                        throw e;
                    }
                    done();
                });
        });

    it('q2 it should search for the following example: \n' +
        pd.xml(query_xml_q2) + '\n' +
        'and find 13 apps.',
        (done) => {
            const q = 'MATCH app\nWHERE ' + query_xml_q2 + '\n RETURN app',
                expected_q2 = JSON.parse(result_json_q2);
            let apps;
            request(app)
                .get('/q')
                .query({ queryText: q })
                .set('Accept', 'application/json')
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.be.an('array', 'Response body is not an array');
                    res.body.should.have.length(13);
                    try {
                        apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected_q2);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected_q2);
                        console.log('Actual:');
                        eyes.inspect(apps);
                        throw e;
                    }
                    done();
                });
        });

    it('q3-a it should search for the following example: \n' +
        pd.xml(query_xml_q3_a) + '\n' + 'and find 4 apps.',
        (done) => {
            const q = 'MATCH app\nWHERE ' + query_xml_q3_a + '\n RETURN app',
                expected_q3_a = JSON.parse(result_json_q3_a);
            let apps;
            request(app)
                .get('/q')
                .query({ queryText: q })
                .set('Accept', 'application/json')
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.be.an('array', 'Response body is not an array');
                    res.body.should.have.length(4);
                    try {
                        apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected_q3_a);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected_q3_a);
                        console.log('Actual:');
                        eyes.inspect(apps);
                        throw e;
                    }
                    done();
                });
        });

    it('q3-b it should search for the following example: \n' +
        pd.xml(query_xml_q3_b) + '\n' +
        'and find 3 apps.',
        (done) => {
            pd.xml(query_xml_q3_b);
            const q = 'MATCH app\nWHERE ' + query_xml_q3_b + '\n RETURN app',
                expected_q3_b = JSON.parse(result_json_q3_b);
            let apps;
            request(app)
                .get('/q')
                .query({ queryText: q })
                .set('Accept', 'application/json')
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.be.an('array', 'Response body is not an array');
                    res.body.should.have.length(3);
                    try {
                        apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected_q3_b);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected_q3_b);
                        console.log('Actual:');
                        eyes.inspect(apps);
                        throw e;
                    }
                    done();
                });
        }
    );

    it('q4 it should search for the following example: \n' +
        pd.xml(query_xml_q4) + '\n' +
        'and find 9 apps.',
        (done) => {
            const q = 'MATCH app\nWHERE ' + query_xml_q4 + '\n RETURN app',
                expected_q4 = JSON.parse(result_json_q4);
            let apps;
            request(app)
                .get('/q')
                .query({ queryText: q })
                .set('Accept', 'application/json')
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.be.an('array', 'Response body is not an array');
                    res.body.should.have.length(9);
                    try {
                        apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected_q4);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected_q4);
                        console.log('Actual:');
                        eyes.inspect(apps);
                        throw e;
                    }
                    done();
                });
        });

    it('q5-a it should search for the following example: \n' +
        pd.xml(query_xml_q5_a) + '\n' +
        'and find 24 apps.',
        (done) => {
            const q = 'MATCH App\nWHERE ' + query_xml_q5_a + '\n RETURN app',
                expected_q5_a = JSON.parse(result_json_q5_a);
            let apps;
            request(app)
                .get('/q')
                .query({ queryText: q })
                .set('Accept', 'application/json')
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.be.an('array', 'Response body is not an array');
                    res.body.should.have.length(24);
                    try {
                        apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected_q5_a);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected_q5_a);
                        console.log('Actual:');
                        eyes.inspect(apps);
                        throw e;
                    }
                    done();
                });
        });

    it('q5-b it should search for the following example: \n' +
        pd.xml(query_xml_q5_b) + '\n' +
        'and find 12 apps:\n' +
        ' "com.facebook.orca, version: 936981"\n' +
        ' "com.sec.chaton , versions: 302115000"\n' +
        ' "com.sec.chaton , version: 207103000"\n' +
        ' "com.tencent.mm, version: 405"',
        (done) => {
            const q = 'MATCH App\nWHERE ' + query_xml_q5_b + '\n RETURN app',
                expected_q5_b = JSON.parse(result_json_q5_b);
            let apps;
            request(app)
                .get('/q')
                .query({ queryText: q })
                .set('Accept', 'application/json')
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.be.an('array', 'Response body is not an array');
                    res.body.should.have.length(12);
                    try {
                        apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected_q5_b);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected_q5_b);
                        console.log('Actual:');
                        eyes.inspect(apps);
                        throw e;
                    }
                    done();
                });
        });

    it('q5-c it should search for the following example: \n' +
        pd.xml(query_xml_q5_c) + '\n' +
        'and find 4 apps.',
        (done) => {
            const q = 'MATCH App\nWHERE ' + query_xml_q5_c + '\n RETURN app',
                expected_q5_c = JSON.parse(result_json_q5_c);
            let apps;
            request(app)
                .get('/q')
                .query({ queryText: q })
                .set('Accept', 'application/json')
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.be.an('array', 'Response body is not an array');
                    res.body.should.have.length(4);
                    try {
                        apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected_q5_c);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected_q5_c);
                        console.log('Actual:');
                        eyes.inspect(apps);
                        throw e;
                    }
                    done();
                });
        });

    it('q6 it should search for the following example: \n' +
        pd.xml(query_xml_q6) + '\n' +
        'and find 32 apps.',
        (done) => {
            const q = 'MATCH app\nWHERE ' + query_xml_q6 + '\n RETURN app',
                expected_q6 = JSON.parse(result_json_q6);
            request(app)
                .get('/q')
                .query({ queryText: q })
                .set('Accept', 'application/json')
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.be.an('array', 'Response body is not an array');
                    res.body.should.have.length(32);
                    try {
                        const apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected_q6);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected_q6);
                        console.log('Actual:');
                        eyes.inspect(res.body);
                        throw e;
                    }
                    done();
                });
        });

    it('q7 it should search for the following example: \n' +
        pd.xml(query_xml_q7) + '\n' +
        'and find 9 apps.',
        (done) => {
            const q = 'MATCH app\nWHERE ' + query_xml_q7 + '\n RETURN app',
                expected_q7 = JSON.parse(result_json_q7);
            let apps;
            request(app)
                .get('/q')
                .query({ queryText: q })
                .set('Accept', 'application/json')
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.be.an('array', 'Response body is not an array');
                    res.body.should.have.length(9);
                    try {
                        apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected_q7);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected_q7);
                        console.log('Actual:');
                        eyes.inspect(apps);
                        throw e;
                    }
                    done();
                });
        });

    it('q8 it should search for the following example: \n' +
        pd.xml(query_xml_q8) + '\n' +
        'and find 1 app: "com.google.android.youtube, version: 5738."\n',
        (done) => {
            const q = 'MATCH app\nWHERE ' + query_xml_q8 + '\n RETURN app',
                expected_q8 = JSON.parse(result_json_q8);
            let apps;
            request(app)
                .get('/q')
                .query({ queryText: q })
                .set('Accept', 'application/json')
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.be.an('array', 'Response body is not an array');
                    res.body.should.have.length(1);
                    try {
                        apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected_q8);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected_q8);
                        console.log('Actual:');
                        eyes.inspect(apps);
                        throw e;
                    }
                    done();
                });
        });

    it('q9 it should search for the following example: \n' +
        pd.xml(query_xml_q9) + '\n' + 'and find 5 apps."',
        (done) => {
            const q = 'MATCH app\nWHERE ' + query_xml_q9 + '\n RETURN app',
                expected_q9 = JSON.parse(result_json_q9);
            let apps;
            request(app)
                .get('/q')
                .query({ queryText: q })
                .set('Accept', 'application/json')
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    should.exist(res.body);
                    res.body.should.be.an('array', 'Response body is not an array');
                    res.body.should.have.length(5);
                    try {
                        apps = _.pluck(res.body, 'app');
                        apps.should.deep.include.members(expected_q9);
                    }
                    catch (e) {
                        console.log('Expected:');
                        eyes.inspect(expected_q9);
                        console.log('Actual:');
                        eyes.inspect(apps);
                        throw e;
                    }
                    done();
                });
        });

    it('q10 it should search for the following example: \n' +
        '<View/>\nand returns a number of apps equal to the limit ' +
        'defined in the config file (' + config.get('results.maxUI') + ')', (done) => {
          const q = 'MATCH app\nWHERE <View/>\n RETURN app';
          let apps = {};
          request(app)
              .get('/q')
              .query({ queryText: q })
              .set('Accept', 'application/json')
              .expect(200)
              .end((err, res) => {
                should.not.exist(err);
                should.exist(res.body);
                res.body.should.be.an('array', 'Response body is not an array');
                res.body.should.have.length(config.get('results.maxUI'));
                done();
              });
    });
    it('q11 it should search for apps that have an element name ' +
       '<android.support.v4.widget.DrawerLayout/> that has any descendant child named ' +
       '<FrameLayout/> using the non-default normal matching mode.', (done) => {
          const q = 'MATCH app\nWHERE <LinearLayout>\n' +
            '\n\t<RelativeLayout></RelativeLayout>' +
            '\n\t<RelativeLayout></RelativeLayout>' +
            '\n\t<RelativeLayout></RelativeLayout>' +
            '\n</LinearLayout>' +
            '\nRETURN app\nMODE normal';
          let apps = {};
         request(app)
             .get('/q')
             .query({ queryText: q })
             .set('Accept', 'application/json')
             .expect(200)
             .end((err, res) => {
               should.not.exist(err);
               should.exist(res.body);
               res.body.should.be.an('array', 'Response body is not an array');
               res.body.should.have.length(35);
               done();
             });
    });
    it('q12 it should search for apps that have the following siblings using normal macth mode:' +
       '<FrameLayout/>\n<FrameLayout/>\n' +
       '<FrameLayout/>\n<FrameLayout/>.\n', (done) => {
          const q = 'MATCH app\nWHERE\n' +
            '\n\t<FrameLayout/>' +
            '\n\t<FrameLayout/>' +
            '\n\t<FrameLayout/>' +
            '\n\t<FrameLayout/>' +
            '\nRETURN app\nMODE normal';
          let apps = {};
         request(app)
             .get('/q')
             .query({ queryText: q })
             .set('Accept', 'application/json')
             .expect(200)
             .end((err, res) => {
               should.not.exist(err);
               should.exist(res.body);
               res.body.should.be.an('array', 'Response body is not an array');
               res.body.should.have.length(18);
               done();
             });
    });
    it('q13 it should search for apps that have the following example using normal macth mode:' +
       '\n<FrameLayout>\n\t<ProgressBar/>\n\t<ImageView/>\n</FrameLayout>\n', (done) => {
          const q = 'MATCH app\nWHERE\n' +
            '\n<FrameLayout>' +
            '\n\t<ProgressBar/>' +
            '\n\t<ImageView/>' +
            '\n\t<TextView/>' +
            '\n</FrameLayout>' +
            '\nRETURN app\nMODE normal';
          let apps = {};
         request(app)
             .get('/q')
             .query({ queryText: q })
             .set('Accept', 'application/json')
             .expect(200)
             .end((err, res) => {
               should.not.exist(err);
               should.exist(res.body);
               res.body.should.be.an('array', 'Response body is not an array');
               res.body.should.have.length(35);
               done();
             });
    });
});
