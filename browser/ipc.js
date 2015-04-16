import ipc from 'ipc';

export default class Ipc {
  constructor(w) {
    this._webContents = w.webContents;
  }

  on(eventName, handler) {
    ipc.on(eventName, function (event, arg) {
      if (event.sender === this._webContents) {
        handler(JSON.parse(arg));
      }
    }.bind(this));
  }

  send(eventName, dataObj) {
    this._webContents.send(eventName, JSON.stringify(dataObj));
  }
}
