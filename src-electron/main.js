'use strict';
require('babel/polyfill');

import log4js from 'log4js';
let logger = log4js.getLogger();

import app from 'app';
import BrowserWindow from 'browser-window';
import crashReporter from 'crash-reporter';
import Menu from 'menu';

let mainWindow = null;
if (process.env.NODE_ENV === 'development') {
  crashReporter.start();
}

app.on('window-all-closed', function() {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('ready', () => {
  let url = 'file://' + __dirname + '/index.html';
  if ('APP_RELATIVE_PATH' in process.env) {
    url = 'file://' + __dirname + '/' + process.env.APP_RELATIVE_PATH;
  }

  //Menu.setApplicationMenu(appMenu);
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768
  });
  logger.info('loading url: ' + url);
  mainWindow.loadUrl(url);
  mainWindow.on('closed', function () {
		mainWindow =  null;
	});

  // mainWindow.openDevTools();
})
