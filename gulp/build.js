'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var _ = require('lodash');
var conf = require('./conf');
var fs = require('fs');
var jspm = require('jspm');
var uglifySaveLicense = require('uglify-save-license');

var packageJson = require('../package.json');


/*
 * Configuration
 */
var paths = {
  jspmBundleTargetModule: 'app',
  jspmBundleOutFile: conf.paths.dist + '/bundle.js'
}


// Compile scripts for distribution
gulp.task('transpile:electron', function () {
  return gulp.src(conf.paths.srcElectron + "/**/*.js")
    .pipe($.plumber(conf.errorHandler))
    .pipe($.sourcemaps.init())
    .pipe($.babel({stage: 2}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(conf.paths.serve))
  ;
});

/*
 * TODO build:fonts task
 */
// gulp.task('build:fonts', function () {
// });


// Write a package.json for distribution
gulp.task('build:packageJson', [], function (done) {
  var json = _.cloneDeep(packageJson);
  json.main = conf.files.electronMain;
  fs.writeFile(conf.paths.dist + '/package.json', JSON.stringify(json), function (err) {
    done();
  });
});

gulp.task('build:jspm:bundle-sfx', function() {
  var builder = new jspm.Builder();
  builder.loadConfig(conf.paths.src + '/jspm.config.js');
  var option = {
    skipSourceMaps: true,
    minify: process.env.JSPM_SFXOPTS_MINIFY
  };

  // log
  $.util.log("Building the single-file sfx bundle"
    + "\n  target modules: " + paths.jspmBundleTargetModule
    + "\n  out file: " + paths.jspmBundleOutFile
    + "\n  option: " + JSON.stringify(option)
  );

  return builder.buildSFX(paths.jspmBundleTargetModule, paths.jspmBundleOutFile, option);
});

gulp.task('build:html', function() {
  return gulp.src([
    // select all html files
    conf.paths.src + "/**/*.html",
    // exclude
    "!" + conf.files.indexFileDev
  ])
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true,
      conditionals: true
    }))
    .pipe(gulp.dest(conf.paths.dist));
});

gulp.task('build:style', function() {
  return gulp.src(conf.paths.src + "/index.less")
    .pipe($.less())
    .pipe($.cssmin())
    .pipe(gulp.dest(conf.paths.dist));
});

gulp.task('build:electron', ['transpile:electron'], function() {
  return gulp.src(conf.paths.serve + "/**/*.js")
    .pipe($.uglify({ preserveComments: uglifySaveLicense }))
    .pipe(gulp.dest(conf.paths.dist));
});

gulp.task('build', [
  'build:html',
  'build:style',
  'build:electron',
  'build:jspm:bundle-sfx',
  'build:packageJson'
]);
