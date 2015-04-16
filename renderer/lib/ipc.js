let ipc = _require('ipc');

export default {
  on(eventName, handler) {
    ipc.on(eventName, function (arg) {
      handler(JSON.parse(arg));
    });
  },

  send(eventName, dataObj) {
    ipc.send(eventName, JSON.stringify(dataObj));
  },
};
