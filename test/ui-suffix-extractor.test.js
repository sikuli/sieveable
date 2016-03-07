/* eslint-env node, mocha */
/* eslint no-console: 0 */
'use strict';
const chai = require('chai'),
  should = chai.should(),
  path = require('path'),
  fs = require('fs'),
  suffixExtractor = require('../lib/index/suffix-extractor');

describe('test UI hierarchical index h1 extractor', function () {
  this.timeout(20000);
  it('should extract parent-child tags', (done) => {
    const file = [path.resolve(__dirname, '../fixtures/examples/index/me.pou.app-188.xml')],
      expected = fs.readFileSync(path.resolve(__dirname,
           '/../fixtures/examples/index/me.pou.app-188-ui-suffix.txt'), 'utf8'),
      target = path.resolve(__dirname, '../indexes/ui/suffix/');
    suffixExtractor(file, target).then(() => {
      const targetFile = path.resolve(__dirname,
                           '../indexes/ui/suffix/me.pou.app-188-ui-suffix.txt'),
        result = fs.readFileSync(targetFile, 'utf8');
      result.should.equal(expected);
      done();
    })
    .catch((e) => {
      should.not.exist(e);
      done(e);
    });
  });
});
