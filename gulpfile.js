const gulp = require('gulp'),
    runSequence = require('run-sequence'),
    requireDir = require('require-dir'),
    tasks = requireDir('./tasks');

gulp.task('solr:schema', (callback) => {
    runSequence('solr:addKeyFields', 'solr:addListingFields', callback);
});

gulp.task('solr:insert', (callback) => {
    runSequence('extract:ui-tag', 'extract:ui-suffix', 'extract:manifest',
        'solr:indexListing', 'solr:indexUITag', 'solr:indexUISuffix',
        'solr:indexManifest', 'solr:indexCode', 'solr:commitAll', callback);
});

gulp.task('redis:insert', (callback) => {
    runSequence('redis:addSolrKeys', callback);
});

gulp.task('leveldb:insert', (callback) => {
    runSequence('leveldb:create', 'leveldb:addListing', 'leveldb:addManifest',
        'leveldb:addUI', callback);
});

gulp.task('default', (callback) => {
    runSequence('solr:create', 'solr:schema', 'extract:archives',
        'solr:insert', 'redis:insert', 'leveldb:insert', callback);
});
