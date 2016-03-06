/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */
'use strict';
const should = require('chai').should(),
  explainQuery = require('../lib/explain_query'),
  eyes = require('eyes');

function compare(expected, actual) {
  try {
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

describe('explain query', function () {
  this.timeout(3000);
  it('explain the simplest UI query', (done) => {
    const query = 'MATCH app\nWHERE\n' +
            '<LinearLayout android:orientation="vertical"></LinearLayout>\n' +
            'RETURN app',
      actual = explainQuery(query),
      expected = {
        match: { app: 'app' },
        ui: '<LinearLayout android:orientation="vertical"/>',
        return: ['app'],
        limit: 100,
        mode: 'strict'
      };
    compare(expected, actual);
    done();
  });

  it('explain the simplest UI query with a special attribute', (done) => {
    const query = 'MATCH app\nWHERE\n<Button $exactly="70"/>\nRETURN app',
      actual = explainQuery(query),
      expected = {
        match: { app: 'app' },
        ui: '<Button $exactly="70"/>',
        return: ['app'],
        limit: 100,
        mode: 'strict'
      };
    compare(expected, actual);
    done();
  });

  it('explain UI query', (done) => {
    const query = 'MATCH app\nWHERE\n' +
      '<LinearLayout>\n' +
      '<Button></Button>\n' +
      '<ProgressBar></ProgressBar>\n' +
      '</LinearLayout>\n' +
      'RETURN app\n' +
      'MODE normal',
      actual = explainQuery(query),
      expected = {
        match: { app: 'app' },
        ui: '<LinearLayout>' +
        '<Button/>' +
        '<ProgressBar/>' +
        '</LinearLayout>',
        return: ['app'],
        limit: 100,
        mode: 'normal'
      };
    compare(expected, actual);
    done();
  });

  it('explain UI query with an anonymous tag', (done) => {
    const query = 'MATCH app\nWHERE' +
            '<LinearLayout>\n' +
            '<_>\n' +
            '<ImageView/>\n' +
            '</_>\n' +
            '</LinearLayout>\n' +
            'RETURN app',
      actual = explainQuery(query),
      expected = {
        match: { app: 'app' },
        ui: '<LinearLayout>' +
          '<_>' +
          '<ImageView/>' +
          '</_>' +
          '</LinearLayout>',
        return: ['app'],
        limit: 100,
        mode: 'strict'
      };
    compare(expected, actual);
    done();
  });

  it('explain listing query', (done) => {
    const query = 'MATCH app\n' +
            'WHERE\n' +
            '<store-category>Communication</store-category>\n' +
            '<developer>Google Inc.</developer>\n' +
            'RETURN app',
      actual = explainQuery(query),
      expected = {
        match: { app: 'app' },
        listing: '<cat>Communication</cat><crt>Google Inc.</crt>',
        return: ['app'],
        limit: 100,
        mode: 'strict'
      };
    compare(expected, actual);
    done();
  });

  it('explain Manifest query', (done) => {
    const query = 'MATCH app\n' +
        'WHERE\n' +
        '<uses-permission android:name="android.permission.CAMERA" />\n' +
        '<activity $min="20" />\n' +
        '<uses-sdk android:minSdkVersion="11"/> \n' +
        'RETURN app',
      actual = explainQuery(query),
      expected = {
        match: { app: 'app' },
        manifest: '<uses-permission android:name="android.permission.CAMERA"/>' +
          '<activity $min="20"/>' +
          '<uses-sdk android:minSdkVersion="11"/>',
        return: ['app'],
        limit: 100,
        mode: 'strict'
      };
    compare(expected, actual);
    done();
  });

  it('explain Code query', (done) => {
    const query = 'MATCH app\n' +
        'WHERE\n' +
        '<Code type="invoked" class="android.hardware.Camera" method="takePicture" />\n' +
        '<Code type="defined" method="createCameraPreviewSession" />\n' +
        'RETURN app',
      actual = explainQuery(query),
      expected = {
        match: { app: 'app' },
        code: '<Code type="invoked" class="android.hardware.Camera" method="takePicture"/>' +
        '<Code type="defined" method="createCameraPreviewSession"/>',
        return: ['app'],
        limit: 100,
        mode: 'strict'
      };
    compare(expected, actual);
    done();
  });

  it('explain a query at all levels', (done) => {
    const query = 'MATCH app\n' +
        'WHERE\n' +
        '<downloads>10000</downloads>\n' +
        '<uses-permission android:name="android.permission.CAMERA" />\n' +
        '<Button $exactly="70"/>\n' +
        '<Code type="invoked" class="android.hardware.Camera" method="takePicture" />\n' +
        'RETURN app',
      actual = explainQuery(query),
      expected = {
        match: { app: 'app' },
        listing: '<dct>10000</dct>',
        ui: '<Button $exactly="70"/>',
        manifest: '<uses-permission android:name="android.permission.CAMERA"/>',
        code: '<Code type="invoked" class="android.hardware.Camera" method="takePicture"/>',
        return: ['app'],
        limit: 100,
        mode: 'strict'
      };
    compare(expected, actual);
    done();
  });

  it('explain a query with specific properties to match', (done) => {
    const query = 'MATCH app(package=com.myapp, latest=true)\n' +
        'WHERE\n' +
        '<downloads>10000</downloads>\n' +
        '<uses-permission android:name="android.permission.CAMERA" />\n' +
        '<Button $exactly="70"/>\n' +
        '<Code type="invoked" class="android.hardware.Camera" method="takePicture" />\n' +
        'RETURN app',
      actual = explainQuery(query),
      expected = {
        match: { app: 'app',
                props: [
                    { name: 'package', value: 'com.myapp' },
                    { name: 'latest', value: true }
                ]
                },
        listing: '<dct>10000</dct>',
        ui: '<Button $exactly="70"/>',
        manifest: '<uses-permission android:name="android.permission.CAMERA"/>',
        code: '<Code type="invoked" class="android.hardware.Camera" method="takePicture"/>',
        return: ['app'],
        limit: 100,
        mode: 'strict'
      };
    compare(expected, actual);
    done();
  });

  it('It should fail to explain a query with invalid properties.', (done) => {
    const query = 'MATCH app(package, latest)\n' +
        'WHERE\n' +
        '<downloads>10000</downloads>\n' +
        'RETURN app',
      actual = explainQuery(query);
    should.not.exist(actual);
    done();
  });
});
