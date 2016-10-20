const {ipcMain} = require('electron')


class Ipc {
  _webContents: WebContents;

  constructor(w: BrowserWindow) {
    this._webContents = w.webContents;
  }

  on(eventName: string, handler: IJsonCallback) {
    ipcMain.on(eventName, (event , arg) => {
      if (event.sender === this._webContents) {
        handler(JSON.parse(arg));
      }
    });
  }

  send(eventName: string, dataObj: any) {
    this._webContents.send(eventName, JSON.stringify(dataObj));
  }
}

export = Ipc;
