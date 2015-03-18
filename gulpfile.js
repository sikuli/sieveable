var gulp = require('gulp'),
    through2 = require('through2')


var indexer = require('./lib/indexer')

gulp.task('build-index', function() {
    
    gulp.src('data/ui-xml/*')
        .pipe(indexer.buildStream())    
        .pipe(gulp.dest('build/'))
})