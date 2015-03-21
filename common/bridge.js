import _ipc from 'ipc';

let ipc;
if (typeof _require === 'function') {
  // _require is renderer's native require
  ipc = _require('ipc');
} else {
  ipc = _ipc;
}

export default {
  webContents: null,

  initialize(browserWindow) {
    // only for a browser process
    this.webContents = browserWindow.webContents;
  },

  sender() {
    return this.webContents ? this.webContents : ipc;
  },

  on(eventName, handler) {
    ipc.on(eventName, function (argOrEvent, maybeArg) {
      // get arg from both browser and renderer
      let arg = typeof argOrEvent === 'string' ? argOrEvent : maybeArg;
      handler(JSON.parse(arg));
    });
  },

  send(eventName, dataObj) {
    this.sender().send(eventName, JSON.stringify(dataObj));
  },
}
