var chai = require('chai');
var should = chai.should();
var path = require("path");
var fs = require("fs");
var tagNameExtractor = require("../lib/index/tag-name-extractor");

describe('test UI tag names and attributes extractor', function () {
    this.timeout(5000);

    it('should extract tag names and attributes', function (done) {
        var file = [path.resolve(__dirname + "/../fixtures/examples/index/me.pou.app-188.xml")];
        var expected = fs.readFileSync(__dirname + "/../fixtures/examples/index/me.pou.app-188-ui-tag.txt", "utf8");
        var target = path.resolve(__dirname + "/../indexes/ui/tag");
        tagNameExtractor(file, target, "-ui-tag", function (err, res) {
            should.not.exist(err);
            var targetFile = path.resolve(__dirname + "/../indexes/ui/tag/me.pou.app-188-ui-tag.txt");
            var exists = fs.existsSync(targetFile);
            exists.should.equal(true);
            var result = fs.readFileSync(targetFile, "utf8");
            result.should.equal(expected);
            done();
        });
    })
})