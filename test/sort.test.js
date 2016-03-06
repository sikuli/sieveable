/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */

'use strict';
const sort = require('../lib/sort.js'),
  chai = require('chai'),
  should = chai.should();

describe('sort', () => {
  it('order and sort attributes', (done) => {
    const firstObject = {
        name: 'LinearLayout',
        type: 'tag',
        attributes: [{
          value: 'fill_parent',
          name: 'android:layout_height'
        }, {
          name: 'android:layout_width',
          value: 'match_parent'
        }]
      },
      secondObject = {
        type: 'tag',
        name: 'LinearLayout',
        attributes: [{
          name: 'android:layout_width',
          value: 'match_parent'
        }, {
          name: 'android:layout_height',
          value: 'fill_parent'
        },
      ] },
      firstObjectSorted = sort(firstObject),
      secondObjectSorted = sort(secondObject);
    should.exist(firstObjectSorted);
    should.exist(secondObjectSorted);
    firstObjectSorted.should.deep.equal(secondObjectSorted);
    done();
  });
});
