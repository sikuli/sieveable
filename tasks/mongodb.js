var gulp = require('gulp');
var path = require('path');
var config = require('config');
var through2 = require('through2');
var mongo = require('../lib/db/connection');
var log = require("../lib/logger");
var DATASET_PATH = path.resolve(__dirname + '/../', 'config', config.get('dataset.path'));
var collectionName = config.get("dbConfig.mongo.collections")[0].collection;

gulp.task('mongo:insertListing', function (done) {
    gulp.src(path.join(DATASET_PATH, 'listing', '*.json'))
        .pipe(new through2.obj(function (file, enc, cb) {
            var doc = JSON.parse(file.contents);
            doc['id'] = doc['n'] + '-' + doc['verc'];
            mongo.upsertOne(collectionName, doc, doc)
                .then(function () {
                    cb();
                })
                .error(function (e) {
                    log.error('Error in insert:listing task: ' + e.message);
                });
        }, function () {
            done();
        }));
});

gulp.task('mongo:indexListing', function (done) {
    mongo.createIndex(collectionName, {id: 1}, {unique: true})
        .then(function () {
            mongo.createIndex(collectionName, {"$**": "text"},
                {name: "FullTextIndex"})
        })
        .then(function () {
            done();
        })
        .error(function (e) {
            log.error('Error in mongoIndex task: ' + e.message);
        })
});

gulp.task('mongo:close', function () {
    mongo.close();
});