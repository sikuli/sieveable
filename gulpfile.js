var gulp = require('gulp');
var runSequence = require('run-sequence');
var requireDir = require('require-dir');
var tasks = requireDir('./tasks');

gulp.task('load:db', function (callback) {
    runSequence('mongo:insertListing', 'mongo:indexListing', 'mongo:close',
        'redis:addKeys', callback)
});

gulp.task('solr:index', function (callback) {
    runSequence('extract:ui-tag', 'extract:ui-h1', 'extract:manifest',
        'solr:indexUITag', 'solr:indexH1', 'solr:indexManifest',
        'solr:indexCode', 'solr:commit', callback)
});

gulp.task('default', function (callback) {
    runSequence('solr:create', 'solr:addField', 'extract:archives', 'solr:index',
        'load:db', callback);
});