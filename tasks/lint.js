const gulp = require('gulp'),
  eslint = require('gulp-eslint');

gulp.task('lint', () => {
  // Files that are defined in .eslintignore are ignored by default.
  return gulp.src(['**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});
