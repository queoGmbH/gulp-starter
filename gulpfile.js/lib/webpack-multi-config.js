if(!TASK_CONFIG.javascripts) return

var path            = require('path')
var pathToUrl       = require('./pathToUrl')
var webpack         = require('webpack')
var webpackManifest = require('./webpackManifest')
var dest            = require('./dest')
var UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

module.exports = function(env) {
  var jsSrc = path.resolve(process.env.PWD, PATH_CONFIG.src, PATH_CONFIG.javascripts.src)
  var jsDest = dest(PATH_CONFIG.javascripts.dest)
  var publicPath = pathToUrl(TASK_CONFIG.javascripts.publicPath || PATH_CONFIG.javascripts.dest, '/')

  var extensions = TASK_CONFIG.javascripts.extensions.map(function(extension) {
    return '.' + extension
  })

  var rev = (TASK_CONFIG.production && TASK_CONFIG.production.rev && env === 'production')
  var filenamePattern = rev ? '[name]-[hash].min.js' : '[name].min.js'

  // should js replaced hot through webpack-hot-middleware
  var hotModuleReplacement = (
      (
        typeof TASK_CONFIG.javascripts.hotModuleReplacement === "undefined"
        ||
        TASK_CONFIG.javascripts.hotModuleReplacement === true
      )
      &&
      typeof TASK_CONFIG.browserSync !== "undefined"
      &&
      env === 'development'
  )

  // TODO: To work in < node 6, prepend process.env.PWD + node_modules/babel-preset- to each
  var defaultBabelConfig = {
    presets: ['es2015', 'stage-1']
  }

  var testPattern = new RegExp(`(\\${TASK_CONFIG.javascripts.extensions.join('$|\\.')}$)`)

  var webpackConfig = {
    context: jsSrc,
    output: {},
    plugins: [],
    resolve: {
      root: jsSrc,
      extensions: [''].concat(extensions),
      alias: TASK_CONFIG.javascripts.alias,
      fallback: path.resolve(process.env.PWD, 'node_modules')
    }, // See https://github.com/facebook/react/issues/4566
    resolveLoader: {
      fallback: path.resolve(process.env.PWD, 'node_modules')
    },
    module: {
      loaders: [
        {
          test: testPattern,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: TASK_CONFIG.javascripts.babel || defaultBabelConfig
        }
      ]
    }
  }

  // Add additional loaders from config
  webpackConfig.module.loaders = webpackConfig.module.loaders.concat(TASK_CONFIG.javascripts.loaders || [])

  if(env === 'development') {
    webpackConfig.devtool = TASK_CONFIG.javascripts.devtool || 'eval-cheap-module-source-map'
    webpackConfig.output.pathinfo = true
  }

  if( hotModuleReplacement === true ) {
    // Create new entries object with webpack-hot-middleware added
    for (var key in TASK_CONFIG.javascripts.entries) {
      var entry = TASK_CONFIG.javascripts.entries[key]
      // TODO: To work in < node 6, prepend process.env.PWD + node_modules/
      TASK_CONFIG.javascripts.entries[key] = ['webpack-hot-middleware/client?&reload=true'].concat(entry)
    }

    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
    // Additional loaders for dev
    webpackConfig.module.loaders = webpackConfig.module.loaders.concat(TASK_CONFIG.javascripts.developmentLoaders || [])
  }

  if(env !== 'test') {
    // Karma doesn't need entry points or output settings
    webpackConfig.entry = TASK_CONFIG.javascripts.entries

    if(TASK_CONFIG.javascripts.extractSharedJs) {
      // Factor out common dependencies into a shared.js
      webpackConfig.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
          name: 'shared',
          filename: filenamePattern,
        })
      )
    }

    // Additional loaders for tests
    webpackConfig.module.loaders = webpackConfig.module.loaders.concat(TASK_CONFIG.javascripts.testLoaders || [])
  }

  if(rev && env !== "development") {
    var destination = (env === 'distribution' ? PATH_CONFIG.dist : PATH_CONFIG.dest)
    webpackConfig.plugins.push(new webpackManifest(PATH_CONFIG.javascripts.dest, destination))
  }

  if( hotModuleReplacement === false ) {
    webpackConfig.output.path = path.normalize(jsDest),
    webpackConfig.output.filename = filenamePattern,
    webpackConfig.output.publicPath = publicPath

    webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          'process.env': {
            'NODE_ENV': JSON.stringify(env)
          }
        })
    )

    // optimize source in production version
    if (env !== "development") {
      webpackConfig.plugins.push(
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.UglifyJsPlugin(),
          new webpack.NoErrorsPlugin()
      )

    // Additional loaders for production
    webpackConfig.module.loaders = webpackConfig.module.loaders.concat(TASK_CONFIG.javascripts.productionLoaders || [])
  }

    // additionally build raw version of files
    if (
        env === "distribution"
        &&
        TASK_CONFIG.javascripts.deployUncompressed
        &&
        TASK_CONFIG.javascripts.deployUncompressed === true
    ) {
      webpackConfig.plugins.push(new UnminifiedWebpackPlugin())
    }
  }

  return webpackConfig
}
