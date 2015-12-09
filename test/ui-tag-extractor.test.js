'use strict';
const chai = require('chai'),
    should = chai.should(),
    path = require('path'),
    fs = require('fs'),
    tagNameExtractor = require('../lib/index/tag-name-extractor');

describe('test UI tag names and attributes extractor', function() {
    this.timeout(5000);

    it('should extract tag names and attributes', (done) => {
        const file = [path.resolve(__dirname + '/../fixtures/examples/index/me.pou.app-188.xml')],
            expected = fs.readFileSync(__dirname + '/../fixtures/examples/index/me.pou.app-188-ui-tag.txt', 'utf8'),
            target = path.resolve(__dirname + '/../indexes/ui/tag');
        tagNameExtractor(file, target, '-ui-tag', (err, res) => {
            should.not.exist(err);
            const targetFile = path.resolve(__dirname + '/../indexes/ui/tag/me.pou.app-188-ui-tag.txt'),
                exists = fs.existsSync(targetFile);
            exists.should.equal(true);
            const result = fs.readFileSync(targetFile, 'utf8');
            result.should.equal(expected);
            done();
        });
    });
});
