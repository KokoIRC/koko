var bridge = require('../bridge');
var Client = require('irc').Client;

exports.connect = function (data) {
  var client = new Client(data.server, data.nickname, {
    userName: data.username,
    realName: data.realname,
    port: data.port,
    encoding: data.encoding,
    autoConnect: false,
  });

  client.connect(bridge.send.bind(bridge, 'connected', {
    server: data.server,
    nickname: data.nickname,
  }));
};
