'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var _ = require('lodash');
var conf = require('./conf');
var path = require('path');
//
// var fs = require('fs');
// var packager = require('electron-packager');
// var merge = require('merge2');
// var browserify = require('browserify');
// var source = require('vinyl-source-stream');
// var buffer = require('vinyl-buffer');
// var packageJson = require('../package.json');
//
//
// // Minify dependent modules.
// gulp.task('bundle:dependencies', function () {
//   var streams = [], dependencies = [];
//   var defaultModules = ['assert', 'buffer', 'console', 'constants', 'crypto', 'domain', 'events', 'http', 'https', 'os', 'path', 'punycode', 'querystring', 'stream', 'string_decoder', 'timers', 'tty', 'url', 'util', 'vm', 'zlib'],
//       electronModules = ['app', 'auto-updater', 'browser-window', 'content-tracing', 'dialog', 'global-shortcut', 'ipc', 'menu', 'menu-item', 'power-monitor', 'protocol', 'tray', 'remote', 'web-frame', 'clipboard', 'crash-reporter', 'native-image', 'screen', 'shell'];
//
//   // Because Electron's node integration, bundle files don't need to include browser-specific shim.
//   var excludeModules = defaultModules.concat(electronModules);
//
//   for(var name in packageJson.dependencies) {
//     dependencies.push(name);
//   }
//
//   // create a list of dependencies' main files
//   var modules = dependencies.map(function (dep) {
//     var packageJson = require(dep + '/package.json');
//     var main;
//     if(!packageJson.main) {
//       main = ['index.js'];
//     }else if(Array.isArray(packageJson.main)){
//       main = packageJson.main;
//     }else{
//       main = [packageJson.main];
//     }
//     return {name: dep, main: main.map(function (it) {return path.basename(it);})};
//   });
//
//   // add babel/polyfill module
//   modules.push({name: 'babel', main: ['polyfill.js']});
//
//   // create bundle file and minify for each main files
//   modules.forEach(function (it) {
//     it.main.forEach(function (entry) {
//       var b = browserify('node_modules/' + it.name + '/' + entry, {
//         detectGlobal: false,
//         standalone: entry
//       });
//       excludeModules.forEach(function (moduleName) {b.exclude(moduleName)});
//       streams.push(b.bundle()
//         .pipe(source(entry))
//         .pipe(buffer())
//         .pipe($.uglify())
//         .pipe(gulp.dest(conf.paths.dist + '/node_modules/' + it.name))
//       );
//     });
//     streams.push(
//       // copy modules' package.json
//       gulp.src('node_modules/' + it.name + '/package.json')
//         .pipe(gulp.dest(conf.paths.dist + '/node_modules/' + it.name))
//     );
//   });
//
//   return merge(streams);
// });
//
// // Write a package.json for distribution
// gulp.task('packageJson', ['bundle:dependencies'], function (done) {
//   var json = _.cloneDeep(packageJson);
//   json.main = 'app.js';
//   fs.writeFile(conf.paths.dist + '/package.json', JSON.stringify(json), function (err) {
//     done();
//   });
// });
//
// Package for each platforms
gulp.task('package', ['win32', 'darwin', 'linux'].map(function (platform) {
  var taskName = 'package:' + platform;
  gulp.task(taskName, ['build'], function (done) {
    packager({
      dir: conf.paths.dist,
      name: 'ElectronApp',
      arch: 'x64',
      platform: platform,
      out: conf.paths.release + '/' + platform,
      version: '0.30.2'
    }, function (err) {
      done();
    });
  });
  return taskName;
}));
