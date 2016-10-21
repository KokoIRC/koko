import _ = require('underscore');
import AppErrorHandler = require('./lib/app-error-handler');
import BufferView = require('./buffer-view');
import Channel = require('./lib/channel');
import configuration = require('./lib/configuration');
import InputBox = require('./input-box');
const {ipcRenderer} = require('electron');
import Log = require('./lib/log');
import Name = require('./lib/name');
import NameView = require('./name-view');
import React = require('react');
import ReactComponent = require('./lib/react-component');
import shortcut = require('./lib/shortcut-manager');
import TabNav = require('./tab-nav');
import TopicView = require('./topic-view');

const rootChannelName = configuration.get('app', 'root-channel-name');
const commandSymbol = configuration.get('app', 'command-symbol');

interface IrcViewProps {
  errorHandler: AppErrorHandler;
}

interface IrcViewState {
  nick: string;
  channels: Channel[];
}

class IrcView extends ReactComponent<IrcViewProps, IrcViewState> {
  initialState(): IrcViewState {
    return {
      nick: '',
      channels: [new Channel(rootChannelName, true)],
    };
  }

  setNick(nick: string) {
    this.setState({nick} as IrcViewState);
    Log.setCurrentNick(nick);
  }

  componentDidMount() {
    // irc events
    ipcRenderer.on('registered', (event, data) => this.setNick(data.nick));
    ipcRenderer.on('message', this.onMessage);
    ipcRenderer.on('join', this.onJoin);
    ipcRenderer.on('part', this.onPart);
    ipcRenderer.on('nick', this.onChangeNick);
    ipcRenderer.on('names', this.onNames);
    ipcRenderer.on('+mode', this.onMode.bind(this, true));
    ipcRenderer.on('-mode', this.onMode.bind(this, false));
    ipcRenderer.on('quit', this.onQuit);
    ipcRenderer.on('whois', this.onWhois);
    ipcRenderer.on('kick', this.onKick);
    ipcRenderer.on('topic', this.onTopic);

    // shortcuts
    shortcut.Manager.on('next-tab', () => {
      let next = Channel.next(this.state.channels);
      this.state.channels = Channel.setCurrent(this.state.channels, next.name);
      this.forceUpdate();
    });
    shortcut.Manager.on('previous-tab', () => {
      let prev = Channel.previous(this.state.channels);
      this.state.channels = Channel.setCurrent(this.state.channels, prev.name);
      this.forceUpdate();
    });

    this.props.errorHandler.on('irc', this.onError);
  }

  render() {
    let channel = Channel.current(this.state.channels);
    let names = channel.names;
    let topic = channel.topic;

    let className = topic ? 'with-topic' : '';

    return (
      <div id='irc-view' className={className}>
        <TabNav channels={this.state.channels} />
        <TopicView topic={topic} />
        <NameView names={names} />
        <BufferView channels={this.state.channels} />
        <InputBox channel={Channel.current(this.state.channels).name}
                  names={names} submit={this.submitInput} />
      </div>
    );
  }

  submitInput(raw: string) {
    let current = Channel.current(this.state.channels);
    if (raw.startsWith(commandSymbol)) {
      raw = raw.substring(1);
      if (!this.tryHandleLocally(raw)) {
        ipcRenderer.send('command', {raw, context: {target: current.name}});
      }
    } else {
      if (current.name !== rootChannelName) {
        ipcRenderer.send('message', {raw, context: {target: current.name}});
        current.send(this.state.nick, raw);
        this.forceUpdate();
      }
    }
  }

  tryHandleLocally(raw: string): boolean {
    let tokens = raw.split(' ');
    if (tokens.length === 1 && tokens[0] === 'part' &&
        Channel.current(this.state.channels).personal) {
      this.partPersonalChat();
      return true;
    } else if (tokens[0] === 'msg') {
      this.startPersonalChat(tokens[1], tokens.splice(2).join(' '));
      return true;
    } else if (tokens.length === 1 && tokens[0] === 'topic') {
      this.showTopic();
      return true;
    }
    return false;
  }

  onMessage(event, data) {
    let to = data.to[0] === '#' || data.to === rootChannelName ? data.to : data.nick;
    let channel = Channel.get(this.state.channels, to);
    if (!channel) {
      channel = new Channel(to);
      this.state.channels.push(channel);
    }
    channel.send(data.nick, data.text, data.isNotice);
    this.forceUpdate();
  }

  onJoin(event, data) {
    let isMe = data.nick === this.state.nick;
    let channel = Channel.get(this.state.channels, data.channel);
    if (!channel) {
      channel = new Channel(data.channel);
      this.state.channels.push(channel);
    }
    if (isMe) {
      this.state.channels = Channel.setCurrent(this.state.channels, data.channel);
    } else {
      channel.addName(data.nick);
    }
    channel.join(data.nick, data.message);
    this.forceUpdate();
  }

  onPart(event, data) {
    let isMe = data.nick === this.state.nick;
    if (isMe && data.channel !== rootChannelName) {
      let prev = Channel.previous(this.state.channels);
      this.state.channels = Channel.remove(this.state.channels, data.channel);
      this.state.channels = Channel.setCurrent(this.state.channels, prev.name);
    } else {
      let channel = Channel.get(this.state.channels, data.channel);
      channel.part(data.nick, data.reason, data.message);
      channel.removeName(data.nick);
    }
    this.forceUpdate();
  }

  startPersonalChat(target: string, raw: string) {
    if (!target || !raw) {
      this.props.errorHandler.handle({
        type: 'normal',
        error: new Error('Invalid command arguments: [nick,message]'),
      });
    } else {
      ipcRenderer.send('message', {raw, context: {target}});
      let channel = Channel.get(this.state.channels, target);
      if (!channel) {
        channel = new Channel(target);
        this.state.channels.push(channel);
      }
      channel.send(this.state.nick, raw);
      this.state.channels = Channel.setCurrent(this.state.channels, target);
      this.forceUpdate();
    }
  }

  showTopic() {
    let channel = Channel.current(this.state.channels);
    channel.showTopic();
    this.forceUpdate();
  }

  partPersonalChat() {
    let current = Channel.current(this.state.channels);
    let prev = Channel.previous(this.state.channels);
    this.state.channels = Channel.remove(this.state.channels, current.name);
    this.state.channels = Channel.setCurrent(this.state.channels, prev.name);
    this.forceUpdate();
  }

  onChangeNick(event, data) {
    if (data.oldnick === this.state.nick) {
      this.setState({nick: data.newnick} as IrcViewState);
      Log.setCurrentNick(data.newnick);
      data.channels.push(rootChannelName);
    }
    data.channels.forEach((channelName) => {
      let channel = Channel.get(this.state.channels, channelName);
      channel.updateName(data.oldnick, data.newnick);
    });
    this.forceUpdate();
  }

  onNames(event, data) {
    let channel = Channel.get(this.state.channels, data.channel);
    let names = Object.keys(data.names).map<Name>((nick: string) => {
      return new Name(nick, data.names[nick], nick === this.state.nick);
    });
    channel.setNames(names);
    this.forceUpdate();
  }

  onMode(isGiving: boolean, data) {
    if (!data.target) {
      // channel mode
      data.target = data.channel;
    }
    let channel = Channel.get(this.state.channels, data.channel);
    if (isGiving) {
      channel.giveMode(data.mode, data.by, data.target);
    } else {
      channel.takeMode(data.mode, data.by, data.target);
    }
    this.forceUpdate();
  }

  onQuit(event, data) {
    data.channels.forEach((channel) => {
      let dataForChannel = _.extend(_.omit(data, 'channels'), {channel});
      this.onPart(event, dataForChannel);
    });
  }

  onWhois(event, data) {
    let info = data.info;
    let root = Channel.get(this.state.channels, rootChannelName);
    let current = Channel.current(this.state.channels);
    root.whois(info);
    current.whois(info);
    this.forceUpdate();
  }

  onKick(event, data) {
    let isMe = data.nick === this.state.nick;
    let channel = Channel.get(this.state.channels, data.channel);
    if (isMe) {
      let root = Channel.get(this.state.channels, rootChannelName);
      root.kick(data.channel, data.nick, data.by, data.reason);
      this.state.channels = Channel.remove(this.state.channels, channel.name);
      this.state.channels = Channel.setCurrent(this.state.channels, rootChannelName);
    } else {
      channel.kick(data.channel, data.nick, data.by, data.reason);
      channel.removeName(data.nick);
    }
    this.forceUpdate();
  }

  onTopic(event, data) {
    let channel = Channel.get(this.state.channels, data.channel);
    channel.setTopic(data.topic, data.nick);
    this.forceUpdate();
  }

  onError(error) {
    switch (error.command) {
    case "err_nosuchnick":
      let channel = Channel.get(this.state.channels, error.args[1]);
      channel.send(error.args[1], error.args[2]);
      this.forceUpdate();
      break;
    }
  }
}

export = IrcView;
