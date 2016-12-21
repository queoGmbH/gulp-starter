var compact = require('lodash/compact')

// Grouped by what can run in parallel
var assetTasks = ['fonts', 'iconFont', 'images', 'svgSprite']
var codeTasks = ['html', 'jade', 'pug', 'stylesheets', 'javascripts']

module.exports = function() {

  function matchFilter(task) {
    if(TASK_CONFIG[task]) {
      if(task === 'javascripts') {
        task = ( global.environment === 'production' ? 'webpack:production' : false )
      }
      return task
    }
  }

  function exists(value) {
    return !!value
  }

  return {
    assetTasks: compact(assetTasks.map(matchFilter).filter(exists)),
    codeTasks: compact(codeTasks.map(matchFilter).filter(exists))
  }
}
