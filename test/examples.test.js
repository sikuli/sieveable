var expect = require('chai').expect,
    fs = require('fs'),
    path = require('path'),
    parse = require('../lib/parse.js'),
    db = require('../lib/db.js')

//TODO: Validate results manually.
describe('examples', function () {
    this.timeout(0);

    it('q1-a', function (done) {
        var content = fs.readFileSync(__dirname + '/../examples/queries/q1-a.xml');
        var q = parse(content);
        db.find(q, function (err, results) {
            expect(results).to.be.have.lengthOf(2);
            done();
        });
    })

    it('q1-b', function (done) {
        var content = fs.readFileSync(__dirname + '/../examples/queries/q1-b.xml');
        var q = parse(content);
        db.find(q, function (err, results) {
            expect(results).to.be.have.lengthOf(60);
            done();
        });
    })

})