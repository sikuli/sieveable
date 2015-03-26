var fs = require('fs'),
    request = require('supertest'),
    parse = require('../lib/parse.js'),
    app = require('../lib/server/server'),
    should = require('should'),
    chai = require("chai");

chai.use(require('chai-things'));
chai.should();

//TODO: Validate results manually.
describe('examples', function () {
    var query_xml_q1_a = fs.readFileSync(__dirname +
    '/../examples/queries/q1-a.xml', 'utf-8');
    this.timeout(0);
    before(function () {
        app.listen(3090, 'localhost', function (error) {
        })
    })

    it('q1-a it should search for the given example (' + query_xml_q1_a +
        ' ) and returns packageName: "com.whatsapp", version: "48364" and "48450"',
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

})