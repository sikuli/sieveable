/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */
'use strict';
const chai = require('chai'),
  should = chai.should(),
  tagParser = require('../lib/parser/tag-parser'),
  suffixParser = require('../lib/parser/suffix-parser'),
  eyes = require('eyes');

function compare(expected, actual) {
  try {
    should.exist(actual);
    actual.should.deep.equal(expected);
  }
  catch (e) {
    console.log('Expected:');
    eyes.inspect(expected);
    console.log('Actual:');
    eyes.inspect(actual);
    throw e;
  }
}

describe('test tag names and suffix array parser', () => {
  it('1- It should extract tag names from a simple UI query.', (done) => {
    const q = '<LinearLayout><Button/><TextView/></LinearLayout>',
      tagNames = tagParser.getTagNames(q),
      suffixNames = suffixParser.getSuffixNames(q);
    compare(['LinearLayout', 'Button', 'TextView'], tagNames);
    compare(['LinearLayout$Button', 'LinearLayout$TextView'], suffixNames);
    done();
  });

  it('2- It should extract tag names from a UI query with attributes and children.', (done) => {
    const q = '<LinearLayout android:orientation="horizontal" android:elevation="6dp">' +
              '<Button/><TextView/></LinearLayout>',
      tagNames = tagParser.getTagNames(q),
      suffixNames = suffixParser.getSuffixNames(q);
    compare(['LinearLayout(android:orientation="horizontal")',
             'LinearLayout(android:elevation="6dp")', 'Button', 'TextView'],
             tagNames);
    compare(['LinearLayout$Button', 'LinearLayout$TextView'], suffixNames);
    done();
  });

  it('3- It should extract tag names from a UI query with children.', (done) => {
    const q = '<LinearLayout><RelativeLayout>' +
              '<Button/><TextView/></RelativeLayout></LinearLayout>',
      tagNames = tagParser.getTagNames(q),
      suffixNames = suffixParser.getSuffixNames(q);
    compare(['LinearLayout', 'RelativeLayout', 'Button', 'TextView'], tagNames);
    compare(['LinearLayout$RelativeLayout$Button',
             'LinearLayout$RelativeLayout$TextView'], suffixNames);
    done();
  });

  it('4- It should extract tag names from a UI tag whose name contains a wild card.', (done) => {
    const q = '<com.myapp.* android:gravity="center"></com.myapp.*>',
      tagNames = tagParser.getTagNames(q),
      suffixNames = suffixParser.getSuffixNames(q);
    compare(['com.myapp.* AND (android:gravity="center")'], tagNames);
    compare([], suffixNames);
    done();
  });

  it('5- It should extract tag names from a UI tag whose name contains a wild card ' +
  'and has children.', (done) => {
    const q = '<com.myapp.* ><EditText/><Button/></com.myapp.*>',
      tagNames = tagParser.getTagNames(q),
      suffixNames = suffixParser.getSuffixNames(q);
    compare(['com.myapp.*', 'EditText', 'Button'], tagNames);
    compare([], suffixNames);
    done();
  });

  it('6- It should extract tag names from an anonymous tag that has children.', (done) => {
    const q = '<_><EditText/><Button/></_>',
      tagNames = tagParser.getTagNames(q),
      suffixNames = suffixParser.getSuffixNames(q);
    compare(['*', 'EditText', 'Button'], tagNames);
    compare([], suffixNames);
    done();
  });

  it('7- It should extract tag names from a tag that has an anonymous child.', (done) => {
    const q = '<TabHost><_><TabWidget/></_></TabHost>',
      tagNames = tagParser.getTagNames(q),
      suffixNames = suffixParser.getSuffixNames(q);
    compare(['TabHost', '*', 'TabWidget'], tagNames);
    compare([], suffixNames);
    done();
  });

  it('8- It should extract tag names from a more complex layout example.', (done) => {
    const q = '<android.support.v7.internal.widget.ActionBarOverlayLayout>' +
                '<FrameLayout/>' +
                '<LinearLayout>' +
                  '<android.support.v7.internal.widget.ActionBarContainer>' +
                    '<android.support.v7.internal.widget.ActionBarView/>' +
                    '<android.support.v7.internal.widget.ActionBarContextView/>' +
                  '</android.support.v7.internal.widget.ActionBarContainer>' +
                  '<ImageView android:layout_height="wrap_content"/>' +
                '</LinearLayout>' +
              '<android.support.v7.internal.widget.ActionBarContainer/>' +
              '</android.support.v7.internal.widget.ActionBarOverlayLayout>',
      tagNames = tagParser.getTagNames(q),
      suffixNames = suffixParser.getSuffixNames(q);
    compare(['android.support.v7.internal.widget.ActionBarOverlayLayout',
    'FrameLayout', 'LinearLayout', 'android.support.v7.internal.widget.ActionBarContainer',
    'android.support.v7.internal.widget.ActionBarView',
    'android.support.v7.internal.widget.ActionBarContextView',
    'ImageView(android:layout_height="wrap_content")'], tagNames);
    compare(['android.support.v7.internal.widget.ActionBarOverlayLayout$FrameLayout',
             'android.support.v7.internal.widget.ActionBarOverlayLayout$LinearLayout$' +
             'android.support.v7.internal.widget.ActionBarContainer' +
             '$android.support.v7.internal.widget.ActionBarView',
             'android.support.v7.internal.widget.ActionBarOverlayLayout$' +
             'LinearLayout$android.support.v7.internal.widget.ActionBarContainer$' +
             'android.support.v7.internal.widget.ActionBarContextView',
             'android.support.v7.internal.widget.ActionBarOverlayLayout$LinearLayout$ImageView',
             'android.support.v7.internal.widget.ActionBarOverlayLayout' +
             '$android.support.v7.internal.widget.ActionBarContainer'],
             suffixNames);
    done();
  });

  it('9- It should only extract the tag name from a single XML element.', (done) => {
    const q = '<Button/>',
      tagNames = tagParser.getTagNames(q),
      suffixNames = suffixParser.getSuffixNames(q);
    compare(['Button'], tagNames);
    compare([], suffixNames);
    done();
  });

  it('10- It should extracts a tag whose attribute value contains a star.', (done) => {
    const q = '<view class="com.myapp.*"/>',
      tagNames = tagParser.getTagNames(q),
      suffixNames = suffixParser.getSuffixNames();
    compare(['view AND com.myapp.*'], tagNames);
    compare([], suffixNames);
    done();
  });
});
