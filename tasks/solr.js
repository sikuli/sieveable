var gulp = require('gulp');
var Promise = require("bluebird");
var config = require("config");
var path = require('path');
var glob = require("glob");
var solrIndex = require('../lib/index/solr-index');
var solrAdmin = require('../lib/index/solr-admin');
var log = require("../lib/logger");
var DATASET_PATH = path.resolve(__dirname, 'config', config.get('dataset.path'));

gulp.task('solr:create', function (callback) {
    var collections = [config.get("dbConfig.solr.uiTagCollection"),
        config.get("dbConfig.solr.uiTagH1Collection"),
        config.get("dbConfig.solr.manifestCollection"),
        config.get("dbConfig.solr.codeCollection")];
    Promise.all([solrAdmin.createCollection(collections[0]),
        solrAdmin.createCollection(collections[1]),
        solrAdmin.createCollection(collections[2]),
        solrAdmin.createCollection(collections[3])])
        .then(function () {
            callback();
        })
        .catch(function (e) {
            log.error("ERROR: " + e.message);
            callback(e);
        })
});

gulp.task('solr:addField', function (callback) {
    var collections = [config.get("dbConfig.solr.uiTagCollection"),
        config.get("dbConfig.solr.uiTagH1Collection"),
        config.get("dbConfig.solr.manifestCollection"),
        config.get("dbConfig.solr.codeCollection")];
    var packageField = {
        "name": "package_name",
        "type": "string",
        "indexed": true,
        "required": true,
        "stored": true
    };
    var versionCodeField = {
        "name": "version_code",
        "type": "int",
        "indexed": true,
        "required": true,
        "stored": true
    };

    Promise.all([
        solrAdmin.addField(collections[0], packageField),
        solrAdmin.addField(collections[0], versionCodeField),
        solrAdmin.addField(collections[1], packageField),
        solrAdmin.addField(collections[1], versionCodeField),
        solrAdmin.addField(collections[2], packageField),
        solrAdmin.addField(collections[2], versionCodeField),
        solrAdmin.addField(collections[3], packageField),
        solrAdmin.addField(collections[3], versionCodeField),
    ])
        .then(function () {
            callback();
        })
        .catch(function (e) {
            log.error("ERROR: " + e.message);
            callback(e);
        })
});

gulp.task('solr:indexUITag', function (callback) {
    var dir = path.resolve(__dirname, 'config', config.get('index.extractUITagDir'));
    var collectionName = config.get("dbConfig.solr.uiTagCollection");
    glob(path.join(dir, '*.txt'), function (err, files) {
        solrIndex.index(files, "-ui-tag.txt", collectionName, function (e) {
            callback(e);
        });
    });
});

gulp.task('solr:indexH1', function (callback) {
    var dir = path.resolve(__dirname, 'config', config.get('index.extractUIH1Dir'));
    var collectionName = config.get("dbConfig.solr.uiTagH1Collection");
    glob(path.join(dir, '*.txt'), function (err, files) {
        solrIndex.index(files, "-ui-h1.txt", collectionName, function (e) {
            callback(e);
        });
    });
});

gulp.task('solr:indexManifest', function (callback) {
    var dir = path.resolve(__dirname, 'config', config.get('index.extractManifestDir'));
    var collectionName = config.get("dbConfig.solr.manifestCollection");
    glob(path.join(dir, '*.txt'), function (err, files) {
        solrIndex.index(files, "-manifest-tag.txt", collectionName, function (e) {
            callback(e);
        });
    });
});

gulp.task('solr:indexCode', function (callback) {
    var collectionName = config.get("dbConfig.solr.codeCollection");
    glob(path.join(DATASET_PATH, 'code', '*.txt'), function (er, files) {
        solrIndex.index(files, ".smali.txt", collectionName, function (err) {
            callback(err);
        });
    });
});

gulp.task('solr:commit', function (callback) {
    var collectionName = config.get("dbConfig.solr.codeCollection");
    solrIndex.commit(collectionName)
        .then(function () {
            callback();
        })
        .catch(function (err) {
            callback(err);
        })
});