'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var _ = require('lodash');
var path = require('path');
var conf = require('./conf');
var jspm = require('jspm');


/*
 * Configuration
 */
var paths = {
  jspmBundleTargetModule: 'app',
  jspmBundleOutFile: conf.paths.dist + '/bundle.js'
}


/**
 * Transpile scripts for Electron
 * 	src: js(es6) files for Electron
 * 	dest: serve dir
 */
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


/**
 * create Self-Executing (SFX) Bundles
 */
gulp.task('build:jspm:bundle-sfx', $.shell.task([
  // create command string with array.join()
  ['jspm bundle-sfx',
    paths.jspmBundleTargetModule,
    paths.jspmBundleOutFile,
    (process.env.JSPM_SFXOPTS_SKIP_SOURCE_MAPS == true) ? '--skip-source-maps' : '',
    (process.env.JSPM_SFXOPTS_MINIFY == true) ? '--minify' : ''
  ].join(' ')
]));

/**
 * build, minify and locate html files
 * 	src: html files for application
 * 	dest: dist dir
 */
gulp.task('build:html', function() {
  return gulp.src([
    // select all html files
    conf.paths.src + "/**/*.html",
    // exclude
    "!" + conf.files.indexFileDev
  ])
    .pipe($.plumber(conf.errorHandler))
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true,
      conditionals: true
    }))
    .pipe(gulp.dest(conf.paths.dist));
});

/**
 * build, minify and locate style files
 * 	src: less for application
 * 	dest: dist dir
 */
gulp.task('build:style', function() {
  return gulp.src(conf.paths.src + "/index.less")
    .pipe($.plumber(conf.errorHandler))
    .pipe($.less())
    .pipe($.cssmin())
    .pipe(gulp.dest(conf.paths.dist));
});

gulp.task('build', [
  'build:html',
  'build:style',
  'build:jspm:bundle-sfx'
]);
