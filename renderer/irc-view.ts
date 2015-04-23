import _ = require('underscore');
import AppErrorHandler = require('./lib/app-error-handler');
import buf = require('./lib/buffers');
import BufferView = require('./buffer-view');
import configuration = require('./lib/configuration');
import InputBox = require('./input-box');
import ipc = require('./lib/ipc');
import Names = require('./lib/names');
import NameView = require('./name-view');
import React = require('react');
import shortcut = require('./lib/shortcut-manager');
import TabNav = require('./tab-nav');
import TypedReact = require('typed-react');

const D = React.DOM;

const rootBufferName = configuration.get('root-buffer-name');
const commandSymbol = configuration.get('command-symbol');

interface IrcViewProps {
  errorHandler: AppErrorHandler;
  server: string;
}

interface IrcViewState {
  nick: string;
  buffers: buf.Buffers;
  names: Names;
}

class IrcView extends TypedReact.Component<IrcViewProps, IrcViewState> {
  getInitialState(): IrcViewState {
    return {
      nick: '',
      buffers: new buf.Buffers(rootBufferName),
      names: new Names(),
    };
  }

  setNick(nick: string) {
    this.setState(<IrcViewState>{nick});
  }

  componentDidMount() {
    // irc events
    ipc.on('registered', data => this.setNick(data.nick));
    ipc.on('message', this.onMessage);
    ipc.on('join', this.onJoin);
    ipc.on('part', this.onPart);
    ipc.on('nick', this.onChangeNick);
    ipc.on('names', this.onNames);
    ipc.on('+mode', this.onMode.bind(this, true));
    ipc.on('-mode', this.onMode.bind(this, false));
    ipc.on('quit', this.onQuit);
    ipc.on('whois', this.onWhois);
    ipc.on('kick', this.onKick);

    // shortcuts
    shortcut.Manager.on('next-tab', () => {
      this.state.buffers.setCurrent(this.state.buffers.next().name);
      this.forceUpdate();
    });
    shortcut.Manager.on('previous-tab', () => {
      this.state.buffers.setCurrent(this.state.buffers.previous().name);
      this.forceUpdate();
    });

    this.props.errorHandler.on('irc', this.onError);
  }

  setWindowTitle(title: string) {
    let titleTag = document.getElementsByTagName('title')[0];
    titleTag.innerText = title;
  }

  render() {
    this.setWindowTitle(this.props.server);

    let currentBufferName = this.state.buffers.current().name;
    let currentNames = this.state.names.get(currentBufferName);

    return (
      D.div({id: 'irc-window'},
        TabNav({buffers: this.state.buffers}),
        NameView({names: currentNames}),
        BufferView({buffers: this.state.buffers}),
        InputBox({channel: this.state.buffers.current().name,
                  names: currentNames,
                  submit: this.submitInput})
      )
    );
  }

  submitInput(raw: string) {
    let target = this.state.buffers.current().name;
    if (raw.indexOf(commandSymbol) === 0) {
      raw = raw.substring(1);
      let methodName = this.tryGetLocalHandler(raw);
      if (methodName) {
        this[methodName](raw);
      } else {
        ipc.send('command', {raw, context: {target}});
      }
    } else {
      if (target !== rootBufferName) {
        ipc.send('message', {raw, context: {target}});
        this.state.buffers.send(target, this.state.nick, raw);
        this.forceUpdate();
      }
    }
  }

  tryGetLocalHandler(raw: string): string {
    let tokens = raw.split(' ');
    if (tokens.length === 1 && tokens[0] === 'part' &&
        this.state.buffers.current().name[0] !== '#') {
      return 'partPersonalChat';
    } else if (tokens[0] === 'pm') {
      return 'startPersonalChat';
    }
  }

  onMessage(data) {
    let to = data.to[0] === '#' || data.to === rootBufferName ? data.to : data.nick;
    this.state.buffers.send(to, data.nick, data.text);
    this.forceUpdate();
  }

  onJoin(data) {
    let isMe = data.nick === this.state.nick;
    if (isMe) {
      this.state.buffers.add(data.channel);
      this.state.buffers.setCurrent(data.channel);
    } else {
      this.state.names.add(data.channel, data.nick);
    }
    this.state.buffers.joinMessage(data.channel, data.nick, data.message);
    this.forceUpdate();
  }

  onPart(data) {
    let isMe = data.nick === this.state.nick;
    if (isMe && data.channel !== rootBufferName) {
      this.state.buffers.remove(data.channel);
      this.state.names.delete(data.channel);
    } else {
      this.state.buffers.partMessage(data.channel, data.nick, data.reason, data.message);
      this.state.names.remove(data.channel, data.nick);
    }
    this.forceUpdate();
  }

  startPersonalChat(raw: string) {
    let tokens = raw.split(' ');
    if (tokens.length < 3) {
      this.props.errorHandler.handle({
        type: 'normal',
        error: new Error('Invalid command arguments: [nick,message]'),
      });
    } else {
      let target = tokens[1];
      let raw = tokens.splice(2).join(' ');
      ipc.send('message', {raw, context: {target}});
      this.state.buffers.send(target, this.state.nick, raw);
      this.state.buffers.setCurrent(target);
      this.forceUpdate();
    }
  }

  partPersonalChat() {
    let target = this.state.buffers.current().name;
    this.state.buffers.remove(target);
    this.forceUpdate();
  }

  onChangeNick(data) {
    if (data.oldnick === this.state.nick) {
      this.setState(<IrcViewState>{nick: data.newnick});
      data.channels.push(rootBufferName);
    }
    data.channels.forEach((channel) => {
      this.state.buffers.changeNick(channel, data.oldnick, data.newnick);
      this.state.names.update(channel, data.oldnick, data.newnick);
    });
    this.forceUpdate();
  }

  onNames(data) {
    let names = Object.keys(data.names).map<IrcName>((nick: string) => {
      return {nick, mode: data.names[nick], isMe: nick === this.state.nick}
    });
    this.state.names.set(data.channel, names);
    this.forceUpdate();
  }

  onMode(isGiving: boolean, data) {
    let names = this.state.names.get(data.channel);
    // FIXME: handles only 'o' and 'v' here.
    if (isGiving) {
      this.state.buffers.giveMode(data.channel, data.mode, data.by, data.target);
      names = names.map(function (name) {
        if (name.nick === data.target) {
          name.mode = data.mode === 'o' ? '@' : (data.mode === 'v' ? '+' : name.mode);
        }
        return name;
      });
    } else {
      this.state.buffers.takeMode(data.channel, data.mode, data.by, data.target);
      if (data.mode === 'o' || data.mode === 'v') {
        names = names.map(function (name) {
          if (name.nick === data.target) {
            name.mode = '';
          }
          return name;
        });
      }
    }
    this.state.names.set(data.channel, names);
    this.forceUpdate();
  }

  onQuit(data) {
    data.channels.forEach((channel) => {
      let dataForChannel = _.extend(_.omit(data, 'channels'), {channel});
      this.onPart(dataForChannel);
    });
  }

  onWhois(data) {
    let info = data.info;
    let currentBufferName = this.state.buffers.current().name;
    this.state.buffers.whois(rootBufferName, info);
    this.state.buffers.whois(currentBufferName, info);
    this.forceUpdate();
  }

  onKick(data) {
    let isMe = data.nick === this.state.nick;
    if (isMe) {
      this.state.buffers.kick(rootBufferName, data.channel, data.nick, data.by, data.reason);
      this.state.buffers.remove(data.channel);
      this.state.names.delete(data.channel);
      this.state.buffers.setCurrent(rootBufferName);
    } else {
      this.state.buffers.kick(data.channel, data.channel, data.nick, data.by, data.reason);
      this.state.names.remove(data.channel, data.nick);
    }
    this.forceUpdate();
  }

  onError(error) {
    switch (error.command) {
    case "err_nosuchnick":
      this.state.buffers.send(error.args[1], error.args[1], error.args[2]);
      this.forceUpdate();
      break;
    }
  }
}

export = React.createFactory(TypedReact.createClass(IrcView));
