import _ from 'underscore';
import ipc from './lib/ipc';
import Buffers from './lib/buffers';
import BufferView from './buffer-view';
import configuration from './lib/configuration';
import InputBox from './input-box';
import Names from './lib/names';
import NameView from './name-view';
import shortcutManager from './lib/shortcut-manager';
import TabNav from './tab-nav';
import React from 'react';

const rootBufferName = configuration.get('root-buffer-name');
const commandSymbol = configuration.get('command-symbol');

export default class IrcView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nick: '',
      buffers: new Buffers(rootBufferName),
      names: new Names(),
    };
  }

  setNick(nick) {
    this.setState({nick});
  }

  componentDidMount() {
    // irc events
    ipc.on('registered', data => this.setNick(data.nick));
    ipc.on('message', this.onMessage.bind(this));
    ipc.on('join', this.onJoin.bind(this));
    ipc.on('part', this.onPart.bind(this));
    ipc.on('nick', this.onChangeNick.bind(this));
    ipc.on('names', this.onNames.bind(this));
    ipc.on('+mode', this.onMode.bind(this, true));
    ipc.on('-mode', this.onMode.bind(this, false));
    ipc.on('quit', this.onQuit.bind(this));
    ipc.on('whois', this.onWhois.bind(this));

    // shortcuts
    shortcutManager.on('next-tab', function () {
      this.state.buffers.setCurrent(this.state.buffers.next().name);
      this.forceUpdate();
    }.bind(this));
    shortcutManager.on('previous-tab', function () {
      this.state.buffers.setCurrent(this.state.buffers.previous().name);
      this.forceUpdate();
    }.bind(this));

    this.props.errorHandler.on('irc', this.onError.bind(this));
  }

  setWindowTitle(title) {
    let titleTag = document.getElementsByTagName('title')[0];
    titleTag.innerText = title;
  }

  render() {
    this.setWindowTitle(this.props.server);

    let currentBufferName = this.state.buffers.current().name;
    let currentNames = this.state.names.get(currentBufferName);

    return (
      <div id='irc-window'>
        <TabNav buffers={this.state.buffers} />
        <NameView names={currentNames} />
        <BufferView buffers={this.state.buffers} />
        <InputBox channel={this.state.buffers.current().name}
                  names={currentNames}
                  submit={this.submitInput.bind(this)} />
      </div>
    );
  }

  submitInput(raw) {
    let target = this.state.buffers.current().name;
    if (raw.startsWith(commandSymbol)) {
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

  tryGetLocalHandler(raw) {
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

  startPersonalChat(raw) {
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
      this.setState({nick: data.newnick});
      data.channels.push(rootBufferName);
    }
    data.channels.forEach(function (channel) {
      this.state.buffers.changeNick(channel, data.oldnick, data.newnick);
      this.state.names.update(channel, data.oldnick, data.newnick);
    }.bind(this));
    this.forceUpdate();
  }

  onNames(data) {
    let names = Object.keys(data.names).map(function (nick) {
      return {nick, mode: data.names[nick], isMe: nick === this.state.nick}
    }.bind(this));
    this.state.names.set(data.channel, names);
    this.forceUpdate();
  }

  onMode(isGiving, data) {
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
    data.channels.forEach(function (channel) {
      let dataForChannel = _.extend(_.omit(data, 'channels'), {channel});
      this.onPart(dataForChannel);
    }.bind(this));
  }

  onWhois(data) {
    let info = data.info;
    let currentBufferName = this.state.buffers.current().name;
    this.state.buffers.whois(rootBufferName, info);
    this.state.buffers.whois(currentBufferName, info);
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
