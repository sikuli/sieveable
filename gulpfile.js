const gulp = require('gulp'),
  runSequence = require('run-sequence'),
  requireDir = require('require-dir');
requireDir('./tasks');

gulp.task('solr:schema', (callback) => {
  runSequence('solr:addKeyFields', 'solr:addListingFields', callback);
});

gulp.task('solr:insert', (callback) => {
  runSequence('extract:ui-tag', 'extract:ui-suffix', 'extract:manifest',
    'solr:indexListing', 'solr:indexUITag', 'solr:indexUISuffix',
    'solr:indexManifest', 'solr:indexCode', 'solr:commitAll', callback);
});

gulp.task('leveldb:insert', (callback) => {
  runSequence('leveldb:create', 'leveldb:addUI', 'leveldb:addManifest',
          'leveldb:addVersionName', callback);
});

gulp.task('default', ['lint'], (callback) => {
  runSequence('solr:exists', 'solr:schema', 'extract:archives',
    'solr:insert', 'leveldb:insert', callback);
});
