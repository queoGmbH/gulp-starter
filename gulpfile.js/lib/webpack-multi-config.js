if(!GULP_CONFIG.tasks.js) return

var path            = require('path')
var pathToUrl       = require('./pathToUrl')
var webpack         = require('webpack')
var webpackManifest = require('./webpackManifest')

module.exports = function(env) {
  var jsSrc = path.resolve(process.env.PWD, GULP_CONFIG.root.src, GULP_CONFIG.tasks.js.src)
  var jsDest = path.resolve(process.env.PWD, GULP_CONFIG.root.dest, GULP_CONFIG.tasks.js.dest)
  var publicPath = pathToUrl(GULP_CONFIG.tasks.js.dest, '/')

  var extensions = GULP_CONFIG.tasks.js.extensions.map(function(extension) {
    return '.' + extension
  })

  var rev = GULP_CONFIG.tasks.production.rev && env === 'production'
  var filenamePattern = rev ? '[name]-[hash].js' : '[name].js'

  var loaders = [];

  var loaders = [];
  for (var key in config.loaders) {
    var loaderConfigPath = path.resolve(config.root.loaders, config.loaders[key])
    var loaderConfig = require(loaderConfigPath)();

    loaders.push(loaderConfig);
  }

  var webpackConfig = {
    context: jsSrc,
    plugins: [],
    resolve: {
      root: path.resolve(config.root.src, '../'),
      extensions: [''].concat(extensions)
    },
    module: {
      loaders: loaders
    }
  }

  if(env === 'development') {
    webpackConfig.devtool = 'inline-source-map'

    // Create new entries object with webpack-hot-middleware added
    for (var key in GULP_CONFIG.tasks.js.entries) {
      var entry = GULP_CONFIG.tasks.js.entries[key]
      GULP_CONFIG.tasks.js.entries[key] = ['webpack-hot-middleware/client?&reload=true'].concat(entry)
    }

    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
  }

  if(env !== 'test') {
    // Karma doesn't need entry points or output settings
    webpackConfig.entry = GULP_CONFIG.tasks.js.entries

    webpackConfig.output= {
      path: path.normalize(jsDest),
      filename: filenamePattern,
      publicPath: publicPath
    }

    if(GULP_CONFIG.tasks.js.extractSharedJs) {
      // Factor out common dependencies into a shared.js
      webpackConfig.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
          name: 'shared',
          filename: filenamePattern,
        })
      )
    }
  }

  if(env === 'production') {
    if(rev) {
      webpackConfig.plugins.push(new webpackManifest(publicPath, GULP_CONFIG.root.dest))
    }
    webpackConfig.plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.NoErrorsPlugin()
    )
  }

  return webpackConfig
}
