var gulp = require('gulp');
var fs = require('fs');
var through2 = require('through2');
var runSequence = require('run-sequence');
var tarbz2 = require('decompress-tarbz2');
var vinylAssign = require('vinyl-assign');
var exec = require('child_process').exec;
var buildIndex = require('./lib/findBy/tagname/searchIndex/build-stream');
var Promise = require("bluebird");
var mongo = require('./lib/db/connection');
var fs = require("fs");
Promise.promisifyAll(fs);

gulp.task('build:tagname', function () {

    gulp.src('fixtures/ui-xml/*.xml')
        .pipe(buildIndex())
        .pipe(gulp.dest('indexes/tagname'))
})

gulp.task('extract:archives', function () {
    gulp.src('fixtures/listing/listing.tar.bz2')
        .pipe(vinylAssign({extract: true}))
        .pipe(tarbz2({strip: 1}))
        .pipe(gulp.dest('fixtures/listing'))

    gulp.src('fixtures/ui-xml/ui-xml.tar.bz2')
        .pipe(vinylAssign({extract: true}))
        .pipe(tarbz2({strip: 1}))
        .pipe(gulp.dest('fixtures/ui-xml'))
})

gulp.task('start:db', function (callback) {
    try {
        fs.mkdirSync('fixtures/db');
    } catch (error) {
        if (error.code != 'EEXIST') callback(error);
    }
    exec('mongod --dbpath ./fixtures/db',
        function (error, stdout, stderr) {
            if (error) {
                console.error(stderr);
                return callback(err);
            }
            console.log(stdout);
            callback(stdout);
        });
})

gulp.task('insert:listing', function () {
    gulp.src('fixtures/listing/*.json').pipe(new through2.obj(function (file, enc, cb) {
        var doc = JSON.parse(file.contents.toString());
        mongo.upsertOne('listings', doc);
        cb();
    }));

})

gulp.task('close:connection', function () {
    mongo.close();
    console.log("MongoDB connection closed.");
})

gulp.task('load:db', ['insert:listing', 'close:connection']);

gulp.task('default', function (callback) {
    runSequence('extract:archives', 'build:tagname', 'start:db',
        'insert:listing', 'close:connection', callback);
});