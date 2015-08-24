'use strict';

var $ = require('gulp-load-plugins')();

$.env({
  vars: {
    JSPM_SFXOPTS_SKIP_SOURCE_MAPS: false,
    JSPM_SFXOPTS_MINIFY: false
  }
});

exports.meta = {
  electronVersion: '0.30.5'
}

exports.paths = {
  src: 'src',
  srcElectron: 'src-electron',
  tmp: '.tmp',
  serve: '.tmp/serve',
  dist: '.tmp/dist',
  release: 'release'
};

exports.files = {
  electronMain: 'main.js',
  indexFileDev: this.paths.src + '/index.dev.html',
  indexFile: this.paths.src + '/index.html'
}

/**
 *  Common implementation for an error handler of a Gulp plugin
 */
exports.errorHandler = function(err) {
  err.showStack = true;
  $.util.log(err.toString());
  this.emit('end');
};
