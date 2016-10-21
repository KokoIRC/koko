import _ = require('underscore');
const {ipcMain, BrowserWindow} = require('electron')
import irc = require('irc');
import IrcCommand = require('./irc-command');

const Client = irc.Client;

export function connect(data: IConnectionData, window) {
  function sendRootMessage(text: string, nick: string) {
    window.webContents.send('message', {
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
    password: data.password,
  });

  client.connect();

  client.on('registered', function (message) {
    window.webContents.send('registered', {nick: message.args[0]});
  });

  function propagate(eventName: string, parameters: string[]) {
    client.on(eventName, function () {
      let args = arguments;
      window.webContents.send(eventName, parameters.reduce(function (result, key, idx) {
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
    if (nick && client._nick === to) {
      window.webContents.send('message', {nick, to, text, isNotice: true});
    }
  });

  client.on('ctcp', function (from, to, text, type) {
    // TODO: FIXME
  });

  client.on('motd', sendRootMessage);

  client.on('error', function (error) {
    window.webContents.send('error', {type: 'irc', error});
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

  ipcMain.on('message', function (event, data) {
    client.say(data.context.target, data.raw);
  });

  ipcMain.on('command', function (event, data: {raw: string, context: ICommandContext}) {
    try {
      let command = IrcCommand.parse(data.raw, data.context);
      client[command.name].apply(client, command.args);
    } catch (error) {
      if (error instanceof IrcCommand.CommandError) {
        window.webContents.send('error', {type: 'normal', error: _.pick(error, 'name', 'message')});
      } else {
        throw error;
      }
    }
  });

  return client;
}
