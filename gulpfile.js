var gulp = require('gulp');
var runSequence = require('run-sequence');
var requireDir = require('require-dir');
var tasks = requireDir('./tasks');

gulp.task('mongo:insert', function (callback) {
    runSequence('mongo:insertListing', 'mongo:indexListing', 'mongo:close',
        callback);
});

gulp.task('solr:insert', function (callback) {
    runSequence('extract:ui-tag', 'extract:ui-suffix', 'extract:manifest',
        'solr:indexUITag', 'solr:indexUISuffix', 'solr:indexManifest',
        'solr:indexCode', 'solr:commit', callback);
});

gulp.task('redis:insert', function (callback) {
    runSequence('redis:addSolrKeys', 'redis:addAllKeys', callback);
});

gulp.task('default', function (callback) {
    runSequence('solr:create', 'solr:addField', 'extract:archives', 'solr:insert',
        'mongo:insert', 'redis:insert', callback);
});