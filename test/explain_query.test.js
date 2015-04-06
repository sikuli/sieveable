var should = require('chai').should(),
    explainQuery = require('../lib/explain_query');

describe('explain query', function () {

    it('explain the simplest UI query', function (done) {
        var query = "MATCH app\n" +
            "WHERE\n" +
            '<LinearLayout android:orientation="vertical"></LinearLayout>\n' +
            "RETURN app";
        var result = explainQuery(query);
        var expected = {
            match: ['app'],
            ui: '<LinearLayout android:orientation="vertical"/>',
            return: ['app'],
            limit: 100
        };
        result.should.deep.equal(expected);
        done();
    })

    it('explain the simplest UI query with a special attribute', function (done) {
        var query = "MATCH app\n" +
            "WHERE\n" +
            '<Button $exactly="70"/>' +
            "RETURN app";
        var result = explainQuery(query);
        var expected = {
            match: ['app'],
            ui: '<Button $exactly="70"/>',
            return: ['app'],
            limit: 100
        };
        result.should.deep.equal(expected);
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
        var result = explainQuery(query);
        var expected = {
            match: ['app'],
            ui: '<LinearLayout>' +
            '<Button/>' +
            '<ProgressBar/>' +
            '</LinearLayout>',
            return: ['app'],
            limit: 100
        };
        result.should.deep.equal(expected);
        done();
    })

    it('explain listing query', function (done) {
        var query = 'MATCH app\n' +
            'WHERE\n' +
            '<store-category>Communication</store-category>\n' +
            '<developer>Google Inc.</developer>\n' +
            'RETURN app';
        var result = explainQuery(query);
        var expected = {
            match: ['app'],
            listing: '<store-category>Communication</store-category>' +
            '<developer>Google Inc.</developer>',
            return: ['app'],
            limit: 100
        };
        result.should.deep.equal(expected);
        done();
    })

    it('explain Manifest query', function (done) {
        var query = 'MATCH app\n' +
            'WHERE\n' +
            '<uses-permission android:name="android.permission.CAMERA" />\n' +
            '<activity $min="20" />\n' +
            '<uses-sdk android:minSdkVersion="11"/> \n' +
            'RETURN app';
        var result = explainQuery(query);
        var expected = {
            match: ['app'],
            manifest: '<uses-permission android:name="android.permission.CAMERA"/>' +
            '<activity $min="20"/>' +
            '<uses-sdk android:minSdkVersion="11"/>',
            return: ['app'],
            limit: 100
        };
        result.should.deep.equal(expected);
        done();
    })

    it('explain Code query', function (done) {
        var query = 'MATCH app\n' +
            'WHERE\n' +
            '<Code type="invoked" class="android.hardware.Camera" method="takePicture" />\n' +
            '<Code type="defined" method="createCameraPreviewSession" />\n' +
            'RETURN app';
        var result = explainQuery(query);
        var expected = {
            match: ['app'],
            code: '<Code type="invoked" class="android.hardware.Camera" method="takePicture"/>' +
            '<Code type="defined" method="createCameraPreviewSession"/>',
            return: ['app'],
            limit: 100
        };
        result.should.deep.equal(expected);
        done();
    })

    it('explain a query at all levels', function (done) {
        var query = 'MATCH app\n' +
            'WHERE\n' +
            '<downloads>10000</downloads>\n' +
            '<uses-permission android:name="android.permission.CAMERA" />\n' +
            '<Button $exactly="70"/>\n' +
            '<Code type="invoked" class="android.hardware.Camera" method="takePicture" />\n' +
            'RETURN app';
        var result = explainQuery(query);
        var expected = {
            match: ['app'],
            listing:'<downloads>10000</downloads>',
            ui:'<Button $exactly="70"/>',
            manifest:'<uses-permission android:name="android.permission.CAMERA"/>',
            code:'<Code type="invoked" class="android.hardware.Camera" method="takePicture"/>',
            return: ['app'],
            limit: 100
        };
        result.should.deep.equal(expected);
        done();
    })

})