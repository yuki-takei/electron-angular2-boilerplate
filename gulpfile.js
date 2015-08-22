'use strict';

var gulp = require('gulp');
var conf = require('./gulp/conf');
var $ = require('gulp-load-plugins')();
var del = require('del');
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

// Delete generated directories.
gulp.task('clean', function (done) {
  del([conf.paths.tmp, conf.paths.release], function () {
    done();
  });
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
