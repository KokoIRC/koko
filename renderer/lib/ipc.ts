const {ipcRenderer} = require('electron');


export = {
  on(eventName: string, handler: IJsonCallback) {
    ipcRenderer.on(eventName, function (arg: string) {
      handler(JSON.parse(arg));
    });
  },

  send(eventName: string, dataObj: any) {
    ipcRenderer.send(eventName, JSON.stringify(dataObj));
  }
};
