if(!GULP_CONFIG.tasks.iconFont) return

var gulp             = require('gulp')
var iconfont         = require('gulp-iconfont')
var generateIconSass = require('./generateIconSass')
var handleErrors     = require('../../lib/handleErrors')
var dest             = require('../../lib/dest')
var package          = require('../../lib/getPackage')()
var path             = require('path')
var url              = require('url')

var fontDest = dest(GULP_CONFIG.tasks.iconFont.dest)
var cssDest = dest(GULP_CONFIG.tasks.css.dest)

var settings = {
  name: package.name + ' icons',
  src: path.resolve(process.env.PWD, GULP_CONFIG.root.src, GULP_CONFIG.tasks.iconFont.src, '*.svg'),
  dest: fontDest,
  sassDest: path.resolve(process.env.PWD, GULP_CONFIG.root.src, GULP_CONFIG.tasks.css.src, GULP_CONFIG.tasks.iconFont.sassDest),
  template: path.normalize('./gulpfile.js/tasks/iconFont/template.sass'),
  sassOutputName: '_icons.sass',
  fontPath: url.resolve('.',path.relative(cssDest, fontDest)),
  className: 'icon',
  options: {
    timestamp: 0, // see https://github.com/fontello/svg2ttf/issues/33
    fontName: 'icons',
    normalize: false,
    formats: config.tasks.iconFont.extensions
  }
}

var iconFontTask = function() {
  return gulp.src(settings.src)
    .pipe(iconfont(settings.options))
    .on('glyphs', generateIconSass(settings))
    .on('error', handleErrors)
    .pipe(gulp.dest(settings.dest))
}

gulp.task('iconFont', iconFontTask)
module.exports = iconFontTask
