var app = require('app');
var bridge = require('./bridge');
var BrowserWindow = require('browser-window');
var irc = require('./backend/irc');

require('crash-reporter').start();

var mainWindow = null;

app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  bridge.initialize(mainWindow);
  bridge.on('connect', function (data) {
    irc.connect(data);
  });
});
