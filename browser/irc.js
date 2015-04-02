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
  let client = new Client(data.server, data.nick, {
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

  let propagate = function (eventName, parameters) {
    client.on(eventName, function () {
      let args = arguments;
      bridge.send(eventName, parameters.reduce(function (result, key, idx) {
        result[key] = args[idx];
        return result;
      }, {}))
    });
  };

  propagate('join', ['channel', 'nick', 'message']);
  propagate('part', ['channel', 'nick', 'reason', 'message']);
  propagate('message', ['nick', 'to', 'text']);

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

  bridge.on('message', function (data) {
    client.say(data.context.target, data.raw);
  });

  bridge.on('command', function (data) {
    let command = CommandParser.parse(data.raw, data.context);
    if (command.valid) {
      client[command.name].apply(client, command.args);
    } else {
      bridge.send('error', {message: command.errMsg});
    }
  });
}
