const gulp = require('gulp'),
  eslint = require('gulp-eslint');

gulp.task('lint', () => {
  return gulp.src(['lib/**/*.js', 'bin/**/*.js', 'tasks/**/*.js', 'test/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});
