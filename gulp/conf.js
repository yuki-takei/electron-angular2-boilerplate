'use strict';

var $ = require('gulp-load-plugins')();

/**
 *  The main paths of your project handle these with care
 */
exports.paths = {
  app: 'app',
  appElectron: 'app-electron',
  serve: '.tmp/serve',
};

/**
 *  Common implementation for an error handler of a Gulp plugin
 */
exports.errorHandler = function(err) {
  err.showStack = true;
  $.util.log(err.toString());
  this.emit('end');
};
