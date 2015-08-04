'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var wrench = require('wrench');

// set default env
$.env({
  vars: {
    NODE_ENV: 'development'
  }
});

/**
 *  This will load all js or coffee files in the gulp directory
 *  in order to load all gulp tasks
 */
wrench.readdirSyncRecursive('./gulp').filter(function(file) {
  return (/\.(js|coffee)$/i).test(file);
}).map(function(file) {
  require('./gulp/' + file);
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
