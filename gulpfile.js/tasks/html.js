if(!GULP_CONFIG.tasks.html) return

var browserSync  = require('browser-sync')
var data         = require('gulp-data')
var gulp         = require('gulp')
var gulpif       = require('gulp-if')
var handleErrors = require('../lib/handleErrors')
var htmlmin      = require('gulp-htmlmin')
var path         = require('path')
var render       = require('gulp-nunjucks-render')
var fs           = require('fs')

var htmlTask = function() {

  var exclude = path.normalize('!**/{' + GULP_CONFIG.tasks.html.excludeFolders.join(',') + '}/**')

  var paths = {
    src: [path.resolve(process.env.PWD, GULP_CONFIG.root.src, GULP_CONFIG.tasks.html.src, '**/*.{' + GULP_CONFIG.tasks.html.extensions + '}'), exclude],
    dest: path.resolve(process.env.PWD, GULP_CONFIG.root.dest, GULP_CONFIG.tasks.html.dest),
    build: path.resolve(process.env.PWD, GULP_CONFIG.root.build, GULP_CONFIG.tasks.html.dest),
  }

  var getData = function(file) {
    var dataPath = path.resolve(process.env.PWD, GULP_CONFIG.root.src, GULP_CONFIG.tasks.html.src, GULP_CONFIG.tasks.html.dataFile)
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  }

  return gulp.src(paths.src)
    .pipe(data(getData))
    .on('error', handleErrors)
    .pipe(render({
      path: [path.resolve(process.env.PWD, GULP_CONFIG.root.src, GULP_CONFIG.tasks.html.src)],
      envOptions: {
        watch: false
      }
    }))
    .on('error', handleErrors)
    .pipe(gulpif(global.production, htmlmin(GULP_CONFIG.tasks.html.htmlmin)))
    .pipe(gulpif(!global.production, gulp.dest(paths.dest)))
    .pipe(gulpif(global.production, gulp.dest(paths.build)))
    .on('end', browserSync.reload)

}

gulp.task('html', htmlTask)
module.exports = htmlTask
