'use strict';

var $ = require('gulp-load-plugins')();

exports.meta = {
  electronVersion: '0.30.2'
}

exports.paths = {
  app: 'app',
  appElectron: 'app-electron',
  serve: '.tmp/serve',
  dist: '.tmp/dist',
  release: 'release'
};

exports.files = {
  appElectronMain: 'main.js'
}

/**
 *  Common implementation for an error handler of a Gulp plugin
 */
exports.errorHandler = function(err) {
  err.showStack = true;
  $.util.log(err.toString());
  this.emit('end');
};
