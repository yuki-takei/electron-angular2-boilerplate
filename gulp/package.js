'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var _ = require('lodash');
var conf = require('./conf');
var path = require('path');
var fs = require('fs');
var uglifySaveLicense = require('uglify-save-license');

var runSequence = require('run-sequence');

var packager = require('electron-packager');

var packageJson = require('../package.json');

/**
 * locate js files
 * 	src: js for Electron (transpiled)
 * 	dest: dist dir
 */
gulp.task('package:build:electron', ['transpile:electron'], function() {
  return gulp.src(conf.paths.serve + "/**/*.js")
    .pipe($.plumber(conf.errorHandler))
    .pipe($.uglify({ preserveComments: uglifySaveLicense }))
    .pipe(gulp.dest(conf.paths.dist));
});

/*
 * Write a package.json for distribution
 * 	src: package.json
 * 	dest: dist dir
 */
gulp.task('package:build:packageJson', [], function (done) {
  var json = _.cloneDeep(packageJson);
  json.main = conf.files.electronMain;
  fs.writeFile(conf.paths.dist + '/package.json', JSON.stringify(json), function (err) {
    done();
  });
});

// define package task for each platforms
gulp.task('package:each-platforms', ['win32', 'darwin', 'linux'].map(function (platform) {
  var taskName = 'package:' + platform;
  gulp.task(taskName, function (done) {
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

gulp.task('package', ['clean'], function(done) {
  // set minify flag true
  $.env({
    vars: {
      JSPM_SFXOPTS_SKIP_SOURCE_MAPS: true,
      JSPM_SFXOPTS_MINIFY: true
    }
  });

  runSequence(
    ['package:build:electron', 'package:build:packageJson', 'build'],
    'package:each-platforms',
    done
  );
});
