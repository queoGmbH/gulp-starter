var gulp            = require('gulp')
var gulpSequence    = require('gulp-sequence')
var getEnabledTasks = require('../lib/getEnabledTasks')
var os              = require('os')
var path            = require('path')

var productionTask = function(cb) {
  global.production = true

  GULP_CONFIG.root.finalDest = GULP_CONFIG.root.dest
  GULP_CONFIG.root.dest = path.join(os.tmpdir(), 'gulp-starter')

  var tasks = getEnabledTasks('production')
  var rev = GULP_CONFIG.tasks.production.rev ? 'rev': false

  gulpSequence('clean', tasks.assetTasks, tasks.codeTasks, rev, 'size-report', 'static', 'replaceFiles', cb)
}

var demoTask = function(cb) {
  global.production = true
  var tasks = getEnabledTasks('production')
  gulpSequence('clean', tasks.assetTasks, tasks.codeTasks, config.tasks.production.rev ? 'rev': false, 'size-report', 'static', cb)
}

gulp.task('production', productionTask)
gulp.task('demo', demoTask)

module.exports = productionTask
