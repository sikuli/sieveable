/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */
'use strict';
const expect = require('chai').expect,
  eyes = require('eyes'),
  parse = require('../lib/parse');

function compare(actual, expected) {
  try {
    expect(actual).to.deep.equal(expected);
  }
    catch (e) {
      console.log('Expected:');
      eyes.inspect(expected);
      console.log('Actual:');
      eyes.inspect(actual);
      throw e;
    }
}
describe('parse', () => {
  it('The simplest query', () => {
    const q = '<LinearLayout></LinaerLayout>',
      actual = parse(q),
      expected = {
        type: 'tag',
        name: 'LinearLayout',
        count: 1
      };
    compare(actual, expected);
  });

  it('A simple tag with an attribute', () => {
    const q = '<LinearLayout android:layout_width="match_parent"/>',
      actual = parse(q),
      expected = {
        type: 'tag',
        name: 'LinearLayout',
        attributes: [{
          name: 'android:layout_width',
          value: 'match_parent',
          toReturn: false
        }],
        count: 1
      };
    compare(actual, expected);
  });

  it('A simple tag with an attribute whose value must be returned in the result', () => {
    const q = '<Button android:text="(*)"/>',
      actual = parse(q),
      expected = { type: 'tag',
                   name: 'Button',
                   attributes: [{
                     name: 'android:text',
                     value: '(*)',
                     toReturn: true
                   }],
                   count: 1
                };
    compare(actual, expected);
  });

  it('A parent-child relationship', () => {
    const q = '<LinearLayout><Button></Button></LinaerLayout>',
      actual = parse(q),
      expected = {
        type: 'tag',
        name: 'LinearLayout',
        children: [{
          type: 'tag',
          name: 'Button',
          count: 1
        }],
        count: 1
      };
    compare(actual, expected);
  });

  it('A parent with exactly two children', () => {
    const q = '<LinearLayout><Button></Button><Button></Button></LinaerLayout>',
      actual = parse(q),
      expected = {
        type: 'tag',
        name: 'LinearLayout',
        children: [{
          type: 'tag',
          name: 'Button',
          count: 2
        }],
        count: 1
      };
    compare(actual, expected);
  });

  it('A parent with exactly two children that have different attributes', () => {
    const q = '<LinearLayout android:layout_width="match_parent"' +
            ' android:layout_height="match_parent"> ' +
            '<Button android:text="@string/send"/> ' +
            '<Button android:layout_width="100dp"' +
            ' android:layout_height="wrap_content"' +
            ' android:layout_gravity="right"/>' +
            '</LinaerLayout>',
      actual = parse(q),
      expected = {
        type: 'tag',
        name: 'LinearLayout',
        attributes: [{
          name: 'android:layout_height', value: 'match_parent',
          toReturn: false
        }, {
          name: 'android:layout_width', value: 'match_parent',
          toReturn: false
        }],
        children: [{
          type: 'tag',
          name: 'Button',
          attributes: [{
            name: 'android:text', value: '@string/send',
            toReturn: false
          }],
          count: 1
        }, {
          type: 'tag',
          name: 'Button',
          attributes: [{
            name: 'android:layout_gravity', value: 'right',
            toReturn: false
          }, {
            name: 'android:layout_height',
            value: 'wrap_content',
            toReturn: false
          }, {
            name: 'android:layout_width', value: '100dp',
            toReturn: false
          }],
          count: 1 }],
        count: 1
      };
    compare(actual, expected);
  });

  it('A parent with exactly four children that have the same attributes', () => {
    const q = '<LinearLayout android:layout_width="match_parent"' +
        ' android:layout_height="match_parent"> ' +
        '<TextView android:layout_width="fill_parent" android:layout_height="wrap_content"/>' +
        '<TextView android:layout_width="fill_parent" android:layout_height="wrap_content"/>' +
        '<TextView android:layout_width="fill_parent" android:layout_height="wrap_content"/>' +
        '<TextView android:layout_width="fill_parent" android:layout_height="wrap_content"/>/>' +
        '</LinaerLayout>',
      actual = parse(q),
      expected = {
        type: 'tag',
        name: 'LinearLayout',
        attributes: [
          {
            name: 'android:layout_height', value: 'match_parent',
            toReturn: false
          }, {
            name: 'android:layout_width', value: 'match_parent',
            toReturn: false
          }],
        count: 1,
        children: [{
          type: 'tag',
          name: 'TextView',
          attributes: [{
            name: 'android:layout_height',
            value: 'wrap_content',
            toReturn: false
          }, {
            name: 'android:layout_width',
            value: 'fill_parent',
            toReturn: false
          }],
          count: 4
        }]
      };
    compare(actual, expected);
  });

  it('Two simple siblings', () => {
    const q = '<Button/> <ImageView/>',
      actual = parse(q),
      expected = [{
        type: 'tag',
        name: 'Button',
        count: 1
      }, {
        type: 'tag',
        name: 'ImageView',
        count: 1
      }];
    compare(actual, expected);
  });

  it('Four siblings, two of which have similar tags and two similar attributes', () => {
    const q = '<Button android:layout_width="wrap_content" ' +
              'android:layout_height="wrap_content"/> ' +
        '<ImageButton android:layout_width="wrap_content" ' +
               'android:layout_height="wrap_content"/> ' +
        '<Button android:layout_width="wrap_content" ' +
               'android:layout_height="wrap_content"/> ' +
        '<ImageButton android:layout_width="wrap_content" ' +
               'android:layout_height="wrap_content"/>',
      actual = parse(q),
      expected = [{
        type: 'tag',
        name: 'Button',
        attributes: [{
          name: 'android:layout_height',
          value: 'wrap_content',
          toReturn: false
        }, {
          name: 'android:layout_width',
          value: 'wrap_content',
          toReturn: false
        }],
        count: 2
      }, {
        type: 'tag',
        name: 'ImageButton',
        attributes: [{
          name: 'android:layout_height',
          value: 'wrap_content',
          toReturn: false
        }, {
          name: 'android:layout_width',
          value: 'wrap_content',
          toReturn: false
        }],
        count: 2
      }];
    compare(actual, expected);
  });

  it('A parent with one child, which is also a parent of another child', () => {
    const q = '<LinearLayout> ' +
            '<FrameLayout> ' +
            '<Button></Button> ' +
            '</FrameLayout>' +
            '</LinearLayout>',
      actual = parse(q),
      expected = {
        type: 'tag',
        name: 'LinearLayout',
        count: 1,
        children: [{
          type: 'tag',
          name: 'FrameLayout',
          count: 1,
          children: [{
            type: 'tag',
            name: 'Button',
            count: 1
          }]
        }]
      };
    compare(actual, expected);
  });

  it('A parent with one child, which is also a parent of another child,' +
     'and every node has its own attributes', () => {
    const q = '<LinearLayout android:layout_width="wrap_content" ' +
                          'android:layout_height="wrap_content"> ' +
            '<FrameLayout android:layout_width="wrap_content" ' +
                          'android:layout_height="wrap_content"> ' +
            '<Button android:layout_width="wrap_content"' +
                          'android:layout_height="wrap_content"/> ' +
            '</FrameLayout>' +
            '</LinearLayout>',
      actual = parse(q),
      expected = {
        type: 'tag',
        name: 'LinearLayout',
        attributes: [
          { name: 'android:layout_height',
            value: 'wrap_content',
            toReturn: false
          }, {
            name: 'android:layout_width',
            value: 'wrap_content',
            toReturn: false
          }],
        count: 1,
        children: [{
          type: 'tag',
          name: 'FrameLayout',
          attributes: [
            {
              name: 'android:layout_height',
              value: 'wrap_content',
              toReturn: false
            }, {
              name: 'android:layout_width',
              value: 'wrap_content',
              toReturn: false
            }],
          count: 1,
          children: [{
            type: 'tag',
            name: 'Button',
            attributes: [{
              name: 'android:layout_height',
              value: 'wrap_content',
              toReturn: false
            }, {
              name: 'android:layout_width',
              value: 'wrap_content',
              toReturn: false
            }],
            count: 1
          }
        ]
        }]
      };
    compare(actual, expected);
  });
});
