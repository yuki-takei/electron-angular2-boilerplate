'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var _ = require('lodash');
var conf = require('./conf');
var path = require('path');
var del = require('del');
var fs = require('fs');

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



// Compile *.scss files with sourcemaps
// gulp.task('compile:styles', function () {
//   return gulp.src([conf.paths.src + '/styles/**/*.scss'])
//     .pipe($.plumber(conf.errorHandler))
//     .pipe($.sourcemaps.init())
//     .pipe($.sass())
//     .pipe($.sourcemaps.write('.'))
//     .pipe(gulp.dest(conf.paths.serve + '/styles'))
//     ;
// });

// Inject *.css(compiled and depedent) files into *.html
// gulp.task('inject:css', ['compile:styles'], function() {
//   var injectOptions = {
//     ignorePath: [conf.paths.src, conf.paths.serve],
//     addPrefix: '..',
//     addRootSlash: false
//   };
//
//   return gulp.src(conf.paths.src + '/**/*.html')
//     .pipe($.plumber(conf.errorHandler))
//     .pipe($.inject(
//         gulp.src(mainBowerFiles()
//           .concat([conf.paths.serve + '/styles/**/*.css'])),
//         injectOptions))
//     .pipe(gulp.dest(conf.paths.serve))
//   ;
// });

// Copy assets
// gulp.task('assets', function () {
//   return gulp.src(conf.paths.src + '/assets/**/*')
//     .pipe(gulp.dest(conf.paths.serve + '/assets'))
//     .pipe(gulp.dest(conf.paths.dist + '/assets'))
//   ;
// });

// Incremental compile ES6, JSX files with sourcemaps
// gulp.task('compile:scripts:watch', function (done) {
//   gulp.src('src/**/*.{js,jsx}')
//     .pipe($.watch('src/**/*.{js,jsx}', {verbose: true}))
//     .pipe($.plumber(conf.errorHandler))
//     .pipe($.sourcemaps.init())
//     .pipe($.babel({stage: 0}))
//     .pipe($.sourcemaps.write('.'))
//     .pipe(gulp.dest(conf.paths.serve))
//   ;
//   done();
// });

// Compile scripts for distribution
// gulp.task('compile:scripts', function () {
//   return gulp.src('src/**/*.{js,jsx}')
//     .pipe($.babel({stage: 0}))
//     .pipe($.uglify())
//     .pipe(gulp.dest(conf.paths.dist))
//   ;
// });

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

// Make HTML and concats CSS files.
// gulp.task('html', ['inject:css'], function () {
//   var assets = $.useref.assets({
//     searchPath: [
//       'bower_components',
//       conf.paths.serve + '/styles'
//     ]
//   });
//
//   return gulp.src(conf.paths.serve + '/renderer/**/*.html')
//     .pipe(assets)
//     .pipe($.if('*.css', $.minifyCss()))
//     .pipe(assets.restore())
//     .pipe($.useref())
//     .pipe(gulp.dest(conf.paths.dist + '/renderer'))
//   ;
// });

// Copy fonts file. You don't need to copy *.ttf nor *.svg nor *.otf.
// gulp.task('copy:fonts', function () {
//   return gulp.src(mainBowerFiles())
//     .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
//     .pipe($.flatten())
//     .pipe(gulp.dest(conf.paths.dist + '/fonts'))
//   ;
// });

// Delete generated directories.
gulp.task('clean', function (done) {
  del([conf.paths.tmp, conf.paths.release], function () {
    done();
  });
});

// gulp.task('serve', ['inject:css', 'compile:scripts:watch', 'assets'], function () {
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
    conf.paths.src + '/!(jspm_packages)/*.ts',
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

gulp.task('build', ['transpile:electron', 'build:bundle:sfx', 'build:packageJson'], function () {
  gulp.src([
    paths.indexFile,
    conf.paths.serve + "/*.js"
  ])
    .pipe(gulp.dest(conf.paths.dist))
});

gulp.task('serve:dist', ['build'], function () {
  electronServer.create({
    path: conf.paths.dist + "/main.js"
  }).start();
});
