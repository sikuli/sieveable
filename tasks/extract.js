var gulp = require('gulp');
var glob = require('glob');
var path = require('path');
var exec = require('child_process').exec;
var Promise = require('bluebird');
var execAsync = Promise.promisify(exec);
var config = require('config');
var mkdirp = require('mkdirp');
var log = require("../lib/logger");
var tagNameExtractor = require("../lib/index/tag-name-extractor");
var h1Extractor = require("../lib/index/h1-extractor");
var DATASET_PATH = path.resolve(__dirname, 'config', config.get('dataset.path'));

gulp.task('extract:archives', function (done) {
    var untarListings = 'tar xvjf ' + path.join(DATASET_PATH, 'listing',
            'listing.tar.bz2') + ' -C ' + path.join(DATASET_PATH, 'listing');
    var untarUI = 'tar xvjf ' + path.join(DATASET_PATH, 'ui', 'ui-xml.tar.bz2') +
        ' -C ' + path.join(DATASET_PATH, 'ui');
    var untarManifest = 'tar xvjf ' + path.join(DATASET_PATH, 'manifest',
            'manifest.tar.bz2') + ' -C ' + path.join(DATASET_PATH,
            'manifest');
    var untarCode = 'tar xvjf ' + path.join(DATASET_PATH, 'code',
            'smali-invoked-methods.tar.bz2') + ' -C ' + path.join(DATASET_PATH,
            'code');

    log.info("Extracting listing details json files...");
    execAsync(untarListings)
        .then(function () {
            log.info("Extracting UI xml files...");
            return execAsync(untarUI);
        })
        .then(function () {
            log.info("Extracting Manifest xml files...");
            return execAsync(untarManifest);
        })
        .then(function () {
            log.info("Extracting code text files...");
            return execAsync(untarCode);
        })
        .then(function () {
            log.info("All archives have been extracted.");
            done();
        })
        .error(function (error) {
            log.error(error);
            done(error);
        });
});

gulp.task('extract:ui-tag', function (callback) {
    // create a directory that contains all extracted files.
    var dir = path.resolve(__dirname, 'config', config.get('index.extractUITagDir'));
    mkdirp.sync(dir, {mode: "2775"});
    // Extract tag names and attributes.
    glob(path.join(DATASET_PATH, 'ui', '*.xml'), function (err, files) {
        tagNameExtractor(files, dir, "-ui-tag", function (e) {
            callback(e);
        });
    });

});

gulp.task('extract:ui-h1', function (callback) {
    // create a directory that contains all extracted files.
    var dir = path.resolve(__dirname, 'config', config.get('index.extractUIH1Dir'));
    mkdirp.sync(dir, {mode: "2775"});
    // Extract tag names and attributes.
    glob(path.join(DATASET_PATH, 'ui', '*.xml'), function (err, files) {
        h1Extractor(files, dir, function (e) {
            callback(e);
        });
    });
});

gulp.task('extract:manifest', function (callback) {
    // create a directory that contains all extracted files.
    var dir = path.resolve(__dirname, 'config', config.get('index.extractManifestDir'));
    mkdirp.sync(dir, {mode: "2775"});
    // Extract tag names and attributes.
    glob(path.join(DATASET_PATH, 'manifest', '*.xml'), function (err, files) {
        tagNameExtractor(files, dir, "-manifest-tag", function (e) {
            callback(e);
        });
    });
});