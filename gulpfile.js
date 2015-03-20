var gulp = require('gulp'),
    through2 = require('through2')


var buildIndex = require('./lib/findBy/tagname/searchIndex/build-stream')

gulp.task('build:tagname', function() {
    
    gulp.src('data/ui-xml/*')
        .pipe(buildIndex())    
        .pipe(gulp.dest('indexes/tagname'))
})