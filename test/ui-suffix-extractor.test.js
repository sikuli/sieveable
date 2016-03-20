/* eslint-env node, mocha */
/* eslint no-console: 0 */
'use strict';
const chai = require('chai'),
  should = chai.should(),
  path = require('path'),
  Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs')),
  suffixExtractor = require('../lib/index/suffix-extractor');

describe('test UI hierarchical index h1 extractor', function () {
  this.timeout(20000);
  it('should extract parent-child tags', (done) => {
    const file = [path.resolve(__dirname, '..', 'fixtures', 'examples',
                  'index', 'me.pou.app-188.xml')],
      target = path.resolve(__dirname, '..', 'indexes', 'ui', 'suffix');

    suffixExtractor(file, target)
    .then(() => {
      return Promise.all([fs.readFileAsync(path.resolve(__dirname,
           '..', 'fixtures', 'examples', 'index', 'me.pou.app-188-ui-suffix.txt'), 'utf8'),
           fs.readFileAsync(path.resolve(__dirname, '..', 'indexes', 'ui',
                                           'suffix', 'me.pou.app-188-ui-suffix.txt'), 'utf8')
         ]);
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
});
