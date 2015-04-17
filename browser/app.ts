import app = require('app');
import crashReporter = require('crash-reporter');
import IrcWindow = require('./irc-window');
import menu = require('./menu');

export function run(mainUrl: string) {
  crashReporter.start();

  app.on('window-all-closed', function() {
    app.quit();
  });

  app.on('ready', function() {
    menu.initialize(app, mainUrl);
    IrcWindow.create(mainUrl);
  });
}
