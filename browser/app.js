import app from 'app';
import crashReporter from 'crash-reporter';
import IrcWindow from './irc-window';
import menu from './menu';

export function run(mainUrl) {
  crashReporter.start();

  app.on('window-all-closed', function() {
    app.quit();
  });

  app.on('ready', function() {
    menu.initialize(app);
    IrcWindow.create(mainUrl);
  });
}
