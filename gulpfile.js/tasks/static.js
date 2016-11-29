var changed = require('gulp-changed')
var gulp    = require('gulp')
var path    = require('path')

var dest = GULP_CONFIG.root.dest;
if (global.production) {
  dest = GULP_CONFIG.root.build;
}

var paths = {
  src: [
    path.resolve(process.env.PWD, GULP_CONFIG.root.src, GULP_CONFIG.tasks.static.src, '**'),
    path.resolve(process.env.PWD, '!' + GULP_CONFIG.root.src, GULP_CONFIG.tasks.static.src, 'README.md')
  ],
  dest: path.resolve(process.env.PWD, dest, GULP_CONFIG.tasks.static.dest)
}

var staticTask = function() {
  return gulp.src(paths.src)
    .pipe(changed(paths.dest)) // Ignore unchanged files
    .pipe(gulp.dest(paths.dest))
}

gulp.task('static', staticTask)
module.exports = staticTask
