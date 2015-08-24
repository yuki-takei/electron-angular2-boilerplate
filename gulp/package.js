'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var _ = require('lodash');
var conf = require('./conf');
var path = require('path');
var fs = require('fs');

var browserify = require('browserify');
var merge = require('merge2');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var packageJson = require('../package.json');

var packager = require('electron-packager');
var runSequence = require('run-sequence');
var uglifySaveLicense = require('uglify-save-license');

/**
 * return modules information that you wants to add partially
 */
function getAdditionalModules() {
  return [
    // {name: 'modules name', main: ['additional files']},
    {name: 'babel', main: ['polyfill.js']}    // babel/polyfill
  ]
}

/**
 * @see https://github.com/Quramy/electron-jsx-babel-boilerplate
 * @see https://github.com/Quramy/electron-jsx-babel-boilerplate/issues/3
 */
// Minify dependent modules.
gulp.task('package:deps-for-electron', function () {
  var streams = [], dependencies = [];
  var defaultModules = ['assert', 'buffer', 'console', 'constants', 'crypto', 'domain', 'events', 'http', 'https', 'os', 'path', 'punycode', 'querystring', 'stream', 'string_decoder', 'timers', 'tty', 'url', 'util', 'vm', 'zlib'],
      electronModules = ['app', 'auto-updater', 'browser-window', 'content-tracing', 'dialog', 'global-shortcut', 'ipc', 'menu', 'menu-item', 'power-monitor', 'protocol', 'tray', 'remote', 'web-frame', 'clipboard', 'crash-reporter', 'native-image', 'screen', 'shell'];

  // Because Electron's node integration, bundle files don't need to include browser-specific shim.
  var excludeModules = defaultModules.concat(electronModules);

  for(var name in packageJson.dependencies) {
    dependencies.push(name);
  }

  // create a list of dependencies' main files
  var modules = dependencies.map(function(dep) {
    var packageJson = require(dep + '/package.json');
    var main;
    if (!packageJson.main) {
      main = ['index.js'];
    } else if (Array.isArray(packageJson.main)) {
      main = packageJson.main;
    } else{
      main = [packageJson.main];
    }
    return {name: dep, main: main};
  });

  // add additional modules
  getAdditionalModules().forEach(function(it) {
    modules.push(it);
  })

  // create bundle file and minify for each main files
  modules.forEach(function (it) {
    it.main.forEach(function (entry) {
      var b = browserify('node_modules/' + it.name + '/' + entry, {
        detectGlobal: false,
        standalone: path.basename(it.name)
      });
      excludeModules.forEach(function (moduleName) {b.exclude(moduleName)});
      streams.push(b.bundle()
        .pipe(source(entry))
        .pipe(buffer())
        .pipe($.uglify())
        .pipe(gulp.dest(conf.paths.dist + '/node_modules/' + it.name))
      );
    });
    streams.push(
      // copy modules' package.json
      gulp.src('node_modules/' + it.name + '/package.json')
        .pipe(gulp.dest(conf.paths.dist + '/node_modules/' + it.name))
    );
  });

  return merge(streams);
});

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
gulp.task('package:build:packageJson', function (done) {
  var json = _.cloneDeep(packageJson);
  json.main = conf.files.electronMain;
  json.devDependencies = {};
  json.jspm = {};
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

gulp.task('package', function(done) {
  // set minify flag true
  $.env({
    vars: {
      JSPM_SFXOPTS_SKIP_SOURCE_MAPS: true,
      JSPM_SFXOPTS_MINIFY: true
    }
  });

  runSequence(
    'clean',
    ['package:build:electron', 'package:build:packageJson', 'package:deps-for-electron', 'build'],
    'package:each-platforms',
    done
  );
});
