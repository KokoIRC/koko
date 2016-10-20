const electron = require('electron');
const ipcMain = electron.ipcMain;


export = {
  on(eventName: string, handler: IJsonCallback) {
    ipcMain.on(eventName, function (arg: string) {
      handler(JSON.parse(arg));
    });
  },

  send(eventName: string, dataObj: any) {
    ipcMain.send(eventName, JSON.stringify(dataObj));
  }
};
