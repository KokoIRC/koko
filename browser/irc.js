import bridge from '../common/bridge';
import {Client} from 'irc';
import {CommandParser} from './irc-command';

function sendRootMessage(text, nick) {
  bridge.send('message', {
    to: '~',
    nick,
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

  client.on('join', function (channel, nick, message) {
    bridge.send('join', {
      channel,
      nick,
      message,
    });
  });

  client.on('message', function (nick, to, text) {
    // FIXME
    console.log(nick, to, text);
  });

  client.on('notice', function (nick, to, text) {
    sendRootMessage(text, nick);
  });

  client.on('ctcp', function (from, to, text, type) {
    // FIXME
    console.log(from, to, text, type);
  });

  client.on('motd', sendRootMessage);

  client.on('error', function (message) {
    bridge.send('error', {message});
  });

  bridge.on('command', function (data) {
    let command = CommandParser.parse(data.raw);
    if (command.valid) {
      client[command.name].apply(client, command.args);
    } else {
      bridge.send('error', {message: command.errMsg});
    }
  });
}
