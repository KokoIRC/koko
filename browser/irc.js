import _ from 'underscore';
import {Client} from 'irc';
import {CommandParser} from './irc-command';

export function connect(data, ipc) {
  function sendRootMessage(text, nick) {
    ipc.send('message', {
      to: '~',
      nick,
      text,
    });
  }

  let client = new Client(data.server, data.nick, {
    userName: data.username,
    realName: data.realname,
    port: data.port,
    encoding: data.encoding,
    autoConnect: false,
  });

  client.connect();

  client.on('registered', function (message) {
    ipc.send('registered', {nick: message.args[0]});
  });

  let propagate = function (eventName, parameters) {
    client.on(eventName, function () {
      let args = arguments;
      ipc.send(eventName, parameters.reduce(function (result, key, idx) {
        result[key] = args[idx];
        return result;
      }, {}))
    });
  };

  propagate('join', ['channel', 'nick', 'message']);
  propagate('part', ['channel', 'nick', 'reason', 'message']);
  propagate('message', ['nick', 'to', 'text']);
  propagate('nick', ['oldnick', 'newnick', 'channels']);
  propagate('names', ['channel', 'names']);
  propagate('quit', ['nick', 'reason', 'channels', 'message']);

  client.on('notice', function (nick, to, text) {
    sendRootMessage(text, nick);
  });

  client.on('ctcp', function (from, to, text, type) {
    // FIXME
    console.log(from, to, text, type);
  });

  client.on('motd', sendRootMessage);

  client.on('error', function (error) {
    ipc.send('error', {type: 'irc', error});
  });

  ipc.on('message', function (data) {
    client.say(data.context.target, data.raw);
  });

  ipc.on('command', function (data) {
    try {
      let command = CommandParser.parse(data.raw, data.context);
      if (command.rawName) {
        client.send.apply(client, [command.rawName].concat(command.args));
      } else {
        client[command.name].apply(client, command.args);
      }
    } catch (error) {
      ipc.send('error', {type: 'normal', error: _.pick(error, 'name', 'message')});
    }
  });
}
