var should = require('chai').should();
var explainQuery = require('../lib/explain_query');
var eyes = require('eyes');

describe('explain query', function () {

    it('explain the simplest UI query', function (done) {
        var query = "MATCH app\n" +
            "WHERE\n" +
            '<LinearLayout android:orientation="vertical"></LinearLayout>\n' +
            "RETURN app";
        var actual = explainQuery(query);
        var expected = {
            match: ['app'],
            ui: '<LinearLayout android:orientation="vertical"/>',
            return: ['app'],
            limit: 100
        };
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
        done();
    })

    it('explain the simplest UI query with a special attribute', function (done) {
        var query = "MATCH app\n" +
            "WHERE\n" +
            '<Button $exactly="70"/>' +
            "RETURN app";
        var actual = explainQuery(query);
        var expected = {
            match: ['app'],
            ui: '<Button $exactly="70"/>',
            return: ['app'],
            limit: 100
        };
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
        done();
    })

    it('explain UI query', function (done) {
        var query = 'MATCH app\n' +
            'WHERE\n' +
            '<LinearLayout>\n' +
            '<Button></Button>\n' +
            '<ProgressBar></ProgressBar>\n' +
            '</LinearLayout>\n' +
            'RETURN app';
        var actual = explainQuery(query);
        var expected = {
            match: ['app'],
            ui: '<LinearLayout>' +
            '<Button/>' +
            '<ProgressBar/>' +
            '</LinearLayout>',
            return: ['app'],
            limit: 100
        };
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
        done();
    })

    it('explain listing query', function (done) {
        var query = 'MATCH app\n' +
            'WHERE\n' +
            '<store-category>Communication</store-category>\n' +
            '<developer>Google Inc.</developer>\n' +
            'RETURN app';
        var actual = explainQuery(query);
        var expected = {
            match: ['app'],
            listing: '<cat>Communication</cat>' +
            '<crt>Google Inc.</crt>',
            return: ['app'],
            limit: 100
        };
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
        done();
    })

    it('explain Manifest query', function (done) {
        var query = 'MATCH app\n' +
            'WHERE\n' +
            '<uses-permission android:name="android.permission.CAMERA" />\n' +
            '<activity $min="20" />\n' +
            '<uses-sdk android:minSdkVersion="11"/> \n' +
            'RETURN app';
        var actual = explainQuery(query);
        var expected = {
            match: ['app'],
            manifest: '<uses-permission android:name="android.permission.CAMERA"/>' +
            '<activity $min="20"/>' +
            '<uses-sdk android:minSdkVersion="11"/>',
            return: ['app'],
            limit: 100
        };
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
        done();
    })

    it('explain Code query', function (done) {
        var query = 'MATCH app\n' +
            'WHERE\n' +
            '<Code type="invoked" class="android.hardware.Camera" method="takePicture" />\n' +
            '<Code type="defined" method="createCameraPreviewSession" />\n' +
            'RETURN app';
        var actual = explainQuery(query);
        var expected = {
            match: ['app'],
            code: '<Code type="invoked" class="android.hardware.Camera" method="takePicture"/>' +
            '<Code type="defined" method="createCameraPreviewSession"/>',
            return: ['app'],
            limit: 100
        };
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
        done();
    })

    it('explain a query at all levels', function (done) {
        var query = 'MATCH app\n' +
            'WHERE\n' +
            '<downloads>10000</downloads>\n' +
            '<callpath/>\n' +
            '<uses-permission android:name="android.permission.CAMERA" />\n' +
            '<Button $exactly="70"/>\n' +
            '<Code type="invoked" class="android.hardware.Camera" method="takePicture" />\n' +
            'RETURN app';
        var actual = explainQuery(query);
        var expected = {
            match: ['app'],
            listing:'<dct>10000</dct>',
            ui:'<Button $exactly="70"/>',
            manifest:'<uses-permission android:name="android.permission.CAMERA"/>',
            code:'<Code type="invoked" class="android.hardware.Camera" method="takePicture"/>',
            perm:'<callpath/>',
            return: ['app'],
            limit: 100
        };
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
        done();
    })

})