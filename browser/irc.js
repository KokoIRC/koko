import bridge from '../common/bridge';
import {Client} from 'irc';

export function connect(data) {
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
}
