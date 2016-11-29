var config            = require('../lib/getConfig')()
if(!config.tasks.browserSync) return

var browserSync       = require('browser-sync')
var gulp              = require('gulp')
var webpack           = require('webpack')
var webpackMultiConfig = require('../lib/webpack-multi-config')
var pathToUrl         = require('../lib/pathToUrl')

var browserSyncTask = function() {
  if(global.environment !== 'development') return

  var webpackConfig = webpackMultiConfig('development')
  var compiler = webpack(webpackConfig)
  var proxyConfig = GULP_CONFIG.tasks.browserSync.proxy || null;

  if (typeof(proxyConfig) === 'string') {
    GULP_CONFIG.tasks.browserSync.proxy = {
      target : proxyConfig
    }
  }

  var server = GULP_CONFIG.tasks.browserSync.proxy || GULP_CONFIG.tasks.browserSync.server;

  if( server ) {
    server.middleware = [
      require('webpack-dev-middleware')(compiler, {
        stats: 'errors-only',
        publicPath: pathToUrl('/', webpackConfig.output.publicPath)
      }),
      require('webpack-hot-middleware')(compiler)
    ]
  }

  browserSync.init(GULP_CONFIG.tasks.browserSync)
}

gulp.task('browserSync', browserSyncTask)
module.exports = browserSyncTask
