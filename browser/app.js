import app from 'app';
import bridge from '../common/bridge';
import crashReporter from 'crash-reporter';
import BrowserWindow from 'browser-window';
import * as irc from './irc';
import menu from './menu';
import shell from 'shell';

export function run(mainUrl) {
  crashReporter.start();

  let mainWindow = null;

  app.on('window-all-closed', function() {
    app.quit();
  });

  app.on('ready', function() {
    mainWindow = new BrowserWindow({width: 800, height: 600});
    menu.initialize(app, mainWindow);

    mainWindow.loadUrl(mainUrl);
    mainWindow.on('closed', function() {
      mainWindow = null;
    });
    mainWindow.on('focus', function () {
      bridge.send('focus', {});
    });
    mainWindow.webContents.on('new-window', function (e, url) {
      shell.openExternal(url);
      e.preventDefault();
    });

    bridge.initialize(mainWindow);
    bridge.on('connect', function (data) {
      irc.connect(data);
    });
  });
}
