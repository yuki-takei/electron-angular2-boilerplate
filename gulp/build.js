'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var _ = require('lodash');
var conf = require('./conf');
var fs = require('fs');
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

gulp.task('build:bundle:sfx', $.shell.task([
  'jspm bundle-sfx ' + paths.jspmBundleTargetModule + ' ' + paths.jspmBundleOutFile + ' --skip-source-maps --minify'
]));

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
  'build:bundle:sfx',
  'build:packageJson'
]);
