// load ipc for both browser and renderer
var ipc;
try {
  ipc = window.require('ipc');
} catch(e) {
  if (e.name === 'ReferenceError') {
    ipc = require('ipc');
  } else {
    throw e;
  }
}

module.exports = {
  webContents: null,
  initialize: function (browserWindow) {
    // only for a browser process
    this.webContents = browserWindow.webContents;
  },
  sender: function () {
    return this.webContents ? this.webContents : ipc;
  },
  on: function (eventName, handler) {
    ipc.on(eventName, function (argOrEvent, maybeArg) {
      // get arg from both browser and renderer
      var arg = typeof argOrEvent === 'string' ? argOrEvent : maybeArg;
      handler(JSON.parse(arg));
    });
  },
  send: function (eventName, dataObj) {
    this.sender().send(eventName, JSON.stringify(dataObj));
  }
};
