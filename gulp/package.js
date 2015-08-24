'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var _ = require('lodash');
var conf = require('./conf');
var path = require('path');

var packager = require('electron-packager');

var packageJson = require('../package.json');

// define package task for each platforms
gulp.task('package', ['win32', 'darwin', 'linux'].map(function (platform) {
  var taskName = 'package:' + platform;
  gulp.task(taskName, ['build'], function (done) {
    // set minify flag true
    $.env({
      vars: {
        JSPM_SFXOPTS_MINIFY: true
      }
    });

    packager({
      dir: conf.paths.dist,
      name: packageJson.name,
      arch: 'x64',
      platform: platform,
      out: conf.paths.release + '/' + platform,
      version: conf.meta.electronVersion,
      overwrite: true
    }, function (err) {
      done();
    });
  });
  return taskName;
}));
