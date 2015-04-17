import ipc = require('ipc');

class Ipc {
  _webContents: WebContents;

  constructor(w: BrowserWindow) {
    this._webContents = w.webContents;
  }

  on(eventName: string, handler: (json: any) => void) {
    ipc.on(eventName, function (event , arg) {
      if (event.sender === this._webContents) {
        handler(JSON.parse(arg));
      }
    }.bind(this));
  }

  send(eventName: string, dataObj: any) {
    this._webContents.send(eventName, JSON.stringify(dataObj));
  }
}

export = Ipc;
