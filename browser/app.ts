import app = require('app');
import configuration = require('./configuration');
import crashReporter = require('crash-reporter');
import IrcWindow = require('./irc-window');
import menu = require('./menu');
import os = require('os');

export function run(mainUrl: string) {
  crashReporter.start();
  global['configuration'] = configuration.load();

  function openNewWindow() {
    menu.initialize(app, mainUrl);
    IrcWindow.create(mainUrl);
  }

  app.on('ready', openNewWindow);
  app.on('activate-with-no-open-windows', openNewWindow);
  app.on('window-all-closed', function () {
    switch (os.platform()) {
      case 'darwin':
        // OS X: do nothing
        break;
      default:
        app.quit();
    }
  });
}
