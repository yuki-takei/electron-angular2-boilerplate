'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var _ = require('lodash');
var conf = require('./conf');
var path = require('path');
var fs = require('fs');
var uglifySaveLicense = require('uglify-save-license');

var electronServer = require('electron-connect').server;

var packageJson = require('../package.json');


/*
 * Configuration
 */
var paths = {
  indexFileDev: conf.paths.src + '/index.dev.html',
  indexFile: conf.paths.src + '/index.html',
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

// Copy fonts file. You don't need to copy *.ttf nor *.svg nor *.otf.
// gulp.task('copy:fonts', function () {
//   return gulp.src(mainBowerFiles())
//     .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
//     .pipe($.flatten())
//     .pipe(gulp.dest(conf.paths.dist + '/fonts'))
//   ;
// });

gulp.task('serve', ['transpile:electron'], function () {
  // switch the pathToApp for BrowserWindow.loadUrl(url) according to the value of NODE_ENV
  $.env({
    vars: {
      APP_RELATIVE_PATH: path.relative(conf.paths.serve, paths.indexFileDev)
    }
  });

  var electron = electronServer.create({
    path: conf.paths.serve + "/main.js"
  });
  electron.start();

  // watch electron src and re-transpile
  gulp.watch([conf.paths.srcElectron + '/**/*.js'], ['transpile:electron']);
  // watch serve dir and restart electron
  gulp.watch([conf.paths.serve + '/**/*.js'], electron.restart);
  // watch app src and reload electron
  gulp.watch([
    conf.paths.src + '/*.ts',
    conf.paths.src + '/*.html',
    conf.paths.src + '/*.less',
    conf.paths.src + '/!(jspm_packages)/**/*.ts',
    conf.paths.src + '/!(jspm_packages)/**/*.html',
    conf.paths.src + '/!(jspm_packages)/**/*.less',
  ], electron.reload);
});


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
    "!" + paths.indexFileDev
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

gulp.task('serve:dist', ['build'], function () {
  electronServer.create({
    path: conf.paths.dist + "/main.js"
  }).start();
});
