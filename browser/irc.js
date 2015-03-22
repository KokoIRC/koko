import bridge from '../common/bridge';
import {Client} from 'irc';

function sendRootMessage(text) {
  bridge.send('message', {
    channel: '~',
    text,
  });
}

export function connect(data) {
  let client = new Client(data.server, data.nickname, {
    userName: data.username,
    realName: data.realname,
    port: data.port,
    encoding: data.encoding,
    autoConnect: false,
  });

  client.connect();

  client.on('registered', function (message) {
    bridge.send('connected', {});
  });

  client.on('message', function (nick, to, text) {
    // FIXME
    console.log(nick, to, text);
  });

  client.on('notice', function (nick, to, text) {
    if (typeof nick === 'undefined' || nick === 'NickServ') {
      sendRootMessage(text);
    } else {
      // FIXME
      console.log(nick, to, text);
    }
  });

  client.on('ctcp', function (from, to, text, type) {
    // FIXME
    console.log(from, to, text, type);
  });

  client.on('motd', sendRootMessage);
}
