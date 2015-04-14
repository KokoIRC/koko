import app from 'app';
import bridge from '../common/bridge';
import crashReporter from 'crash-reporter';
import BrowserWindow from 'browser-window';
import * as irc from './irc';
import menu from './menu';

export function run(mainUrl) {
  crashReporter.start();

  let mainWindow = null;

  app.on('window-all-closed', function() {
    app.quit();
  });

  app.on('ready', function() {
    menu.initialize(app);

    mainWindow = new BrowserWindow({width: 800, height: 600});
    mainWindow.loadUrl(mainUrl);
    mainWindow.on('closed', function() {
      mainWindow = null;
    });
    mainWindow.on('focus', function () {
      bridge.send('focus', {});
    });

    bridge.initialize(mainWindow);
    bridge.on('connect', function (data) {
      irc.connect(data);
    });
  });
}
