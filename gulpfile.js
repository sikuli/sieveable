var gulp = require('gulp');
var path = require('path');
var fs = require('fs');
var glob = require("glob")
var through2 = require('through2');
var runSequence = require('run-sequence');
var tarbz2 = require('decompress-tarbz2');
var vinylAssign = require('vinyl-assign');
var exec = require('child_process').exec;
var uiIndex = require('./lib/findBy/tagname/searchIndex/build-stream');
var codeIndex = require('./lib/findBy/code/searchIndex/build-stream');
var Promise = require("bluebird");
var config = require("config");
var mongo = require('./lib/db/connection');
var DATASET_ROOT = config.get('dataset.root');

gulp.task('index:ui', function () {
    gulp.src(path.join(DATASET_ROOT, 'ui', '*.xml'))
        .pipe(uiIndex())
        .pipe(gulp.dest('indexes/tagname'))
})

gulp.task('index:code', function (callback) {
    runSequence('solr:indexCode', 'solr:commit', callback);
})

gulp.task('solr:indexCode', function (callback) {
    glob(path.join(DATASET_ROOT, 'code', '*.txt'), function (er, files) {
        codeIndex.index(files);
    });
    callback();
})

gulp.task('solr:commit', function () {
    codeIndex.commit();
})

gulp.task('extract:archives', function () {
    // Extract listing details JSON files
    gulp.src(path.join(DATASET_ROOT, 'listing', 'listing.tar.bz2'))
        .pipe(vinylAssign({extract: true}))
        .pipe(tarbz2({strip: 1}))
        .pipe(gulp.dest(path.join(DATASET_ROOT, 'listing')))
    // Extract UI xml files
    gulp.src(path.join(DATASET_ROOT, 'ui', 'ui-xml.tar.bz2'))
        .pipe(vinylAssign({extract: true}))
        .pipe(tarbz2({strip: 1}))
        .pipe(gulp.dest(path.join(DATASET_ROOT, 'ui')))
    // Extract smali code text files
    gulp.src(path.join(DATASET_ROOT, 'code', 'smali-invoked-methods.tar.bz2'))
        .pipe(vinylAssign({extract: true}))
        .pipe(tarbz2({strip: 1}))
        .pipe(gulp.dest(path.join(DATASET_ROOT, 'code')))
})

gulp.task('start:db', function (callback) {
    try {
        fs.mkdirSync(path.join(DATASET_ROOT, 'db'));
    } catch (error) {
        if (error.code != 'EEXIST') callback(error);
    }
    // start Solr in SolrCloud mode as a daemon
    var solr = 'solr start -cloud -V -h ' + config.get('dbConfig.solr.host') +
        ' -p ' + config.get('dbConfig.solr.port')
    console.log("Starting Solr server in SolrCloud mode. " + solr);
    exec(solr,
        function (error, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            callback(stderr);
        });
    // start MongoDB
    var mongod = 'mongod --port ' + config.get('dbConfig.mongo.port') +
        ' --config ' + config.get('dbConfig.mongo.config') +
        ' --dbpath ' + path.join(DATASET_ROOT, 'db')
    console.log("Starting MongoDB server: " + mongod);
    exec(mongod,
        function (error, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            callback(stderr);
        });
})

gulp.task('insert:listing', function () {
    gulp.src(path.join(DATASET_ROOT, 'listing', '*.json'))
        .pipe(new through2.obj(function (file, enc, cb) {
            var doc = JSON.parse(file.contents);
            console.log(doc)
            mongo.upsertOne('listings', doc, doc)
                .then(function () {
                    //mongo.close();
                    cb();
                })
                .error(function (e) {
                    console.error('Error in insert:listing task: ' + e.message);
                });
            ;
        }, function () {
            mongo.close()
        }));
})

gulp.task('insert:listingId', function () {
    gulp.src(path.join(DATASET_ROOT, 'listing', '*.json'))
        .pipe(new through2.obj(function (file, enc, cb) {
            var doc = JSON.parse(file.contents.toString());
            var id = {id: doc.n + '-' + doc.verc};
            mongo.upsertOne('listings', doc, id)
                .then(function () {
                    cb();
                })
                .error(function (e) {
                    console.error('Error in insert:listingId task: ' + e.message);
                });
        }, function () {
            mongo.close()
        }))
});

gulp.task('mongoIndex', function () {
    mongo.createIndex('listings', {id: 1}, {unique: true})
        .error(function (e) {
            console.error('Error in mongoIndex task: ' + e.message);
        }, function () {
            mongo.close()
        })
});


gulp.task('load:db', function (callback) {
    runSequence('insert:listing', 'insert:listingId', 'mongoIndex', callback)
});

gulp.task('default', function (callback) {
    runSequence('extract:archives', 'build:tagname',
        'load:db', callback);
});