/* eslint-env node, mocha */
'use strict';
const Promise = require('bluebird'),
  chai = require('chai'),
  should = chai.should(),
  path = require('path'),
  fs = Promise.promisifyAll(require('fs')),
  tagNameExtractor = require('../lib/index/tag-name-extractor');

describe('test UI tag names and attributes extractor', function () {
  this.timeout(5000);
  it('should extract tag names and attributes', (done) => {
    const file = [path.resolve(__dirname, '..', 'fixtures',
                              'examples', 'index', 'me.pou.app-188.xml')],
      target = path.resolve(__dirname, '..', 'indexes', 'ui', 'tag');
    tagNameExtractor(file, target, '-ui-tag')
    .then(() => {
      const actualFile = path.resolve(__dirname, '', '..', 'indexes', 'ui',
                                      'tag', 'me.pou.app-188-ui-tag.txt'),
        expectedFile = path.resolve(__dirname, '..', 'fixtures', 'examples',
                                      'index', 'me.pou.app-188-ui-tag.txt');
      return Promise.all([fs.readFileAsync(expectedFile, 'utf8'),
                          fs.readFileAsync(actualFile, 'utf8')]);
    })
    .spread((expected, actual) => {
      actual.should.equal(expected);
      done();
    })
    .catch((e) => {
      should.not.exist(e);
      done(e);
    });
  });

  it('should fail to extract tag names and attributes for invalid files', (done) => {
    const file = [path.resolve(__dirname, '..', 'fixtures', 'examples',
                              'index', 'no.such.file-123.xml')],
      targetDir = path.resolve(__dirname, '..', 'no-such-dir');
    tagNameExtractor(file, targetDir, '-ui-tag')
    .then(() => {
      const targetFile = path.join(targetDir, 'no.such.file-123-ui-tag.txt');
      return fs.statAsync(targetFile);
    })
    .then((statObj) => {
      should.not.exist(statObj);
      done(statObj);
    })
    .catch((e) => {
      should.exist(e);
      e.code.should.equal('ENOENT');
      done();
    });
  });
});
