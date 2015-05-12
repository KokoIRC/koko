import _ = require('underscore');
import Ipc = require('./ipc');
import irc = require('irc');
import IrcCommand = require('./irc-command');

const Client = irc.Client;

export function connect(data: ConnectionData, ipc: Ipc) {
  function sendRootMessage(text: string, nick: string) {
    ipc.send('message', {
      to: '~',
      nick,
      text,
    });
  }

  let client = new Client(data.host, data.nick, {
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

  function propagate(eventName: string, parameters: string[]) {
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
  propagate('+mode', ['channel', 'by', 'mode', 'target', 'message']);
  propagate('-mode', ['channel', 'by', 'mode', 'target', 'message']);
  propagate('whois', ['info']);
  propagate('kick', ['channel', 'nick', 'by', 'reason', 'message']);
  propagate('topic', ['channel', 'topic', 'nick', 'message']);

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

  client.on('raw', function (message) {
    console.log(message);
  });

  sendRootMessage('Looking up host...', 'Connection');
  client.conn.on('lookup', function (err: Error) {
    if (err) {
      sendRootMessage('Error in looking up: ' + err, 'Connection');
    } else {
      sendRootMessage('Connecting to server...', 'Connection');
    }
  });
  client.conn.on('connect', function () {
    sendRootMessage('Connected.', 'Connection');
  });
  client.conn.on('error', function (err: Error) {
    sendRootMessage('Error: ' + err, 'Connection');
  });
  client.conn.on('close', function () {
    sendRootMessage('Connection closed.', 'Connection');
  });

  ipc.on('message', function (data) {
    client.say(data.context.target, data.raw);
  });

  ipc.on('command', function (data: {raw: string, context: CommandContext}) {
    try {
      let command = IrcCommand.parse(data.raw, data.context);
      client[command.name].apply(client, command.args);
    } catch (error) {
      if (error instanceof IrcCommand.CommandError) {
        ipc.send('error', {type: 'normal', error: _.pick(error, 'name', 'message')});
      } else {
        throw error;
      }
    }
  });
}
