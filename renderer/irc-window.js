import bridge from '../common/bridge';
import Buffers from './lib/buffers';
import BufferView from './buffer-view';
import InputBox from './input-box';
import ModeManager, {Mode} from './lib/mode-manager';
import TabNav from './tab-nav';
import React from 'react';

const rootBufferName = '~';

export default class IrcWindow extends React.Component {
  constructor(props) {
    super(props);
    this.modeManager = new ModeManager(Mode.NORMAL);
    this.state = {
      nick: '',
      buffers: new Buffers(rootBufferName),
      mode: this.modeManager.current(),
    };
  }

  setNick(nick) {
    this.setState({nick});
  }

  setBuffers(func) {
    return function (data) {
      func(data);
      this.setState({
        buffers: this.state.buffers
      });
    }.bind(this);
  }

  componentDidMount() {
    this.modeManager.onChange(function (to) {
      this.setState({mode: to});
    }.bind(this));

    bridge.on('registered', data => this.setNick(data.nick));
    bridge.on('message', this.setBuffers(data =>
      this.state.buffers.send(data.to, data.nick, data.text)));
    bridge.on('join', this.setBuffers(data =>
      this.state.buffers.join(data.channel, data.nick, data.message,
                              data.nick === this.state.nick)));
    bridge.on('part', this.setBuffers(data =>
      this.state.buffers.part(data.channel, data.nick, data.reason, data.message,
                              data.nick === this.state.nick)));
    bridge.on('nick', this.changeNick.bind(this));
  }

  setWindowTitle(title) {
    let titleTag = document.getElementsByTagName('title')[0];
    titleTag.innerText = `koko - ${title}`;
  }

  render() {
    this.setWindowTitle(this.props.server);

    return (
      <div id='irc-window'>
        <TabNav buffers={this.state.buffers} />
        <BufferView buffers={this.state.buffers} />
        <InputBox mode={this.state.mode} submit={this.submitInput.bind(this)} />
      </div>
    );
  }

  submitInput(raw) {
    let target = this.state.buffers.current().name;

    let resetToNormal = true;
    switch (this.state.mode) {
    case Mode.COMMAND:
      bridge.send(Mode.toString(this.state.mode), {raw, context: {target}});
      break;
    case Mode.MESSAGE:
      if (target !== rootBufferName) {
        bridge.send(Mode.toString(this.state.mode), {raw, context: {target}});
        this.state.buffers.send(target, this.state.nick, raw);
        this.setState({buffer: this.state.buffer});
        resetToNormal = false;
      }
      break;
    }

    if (resetToNormal) {
      this.modeManager.setMode(Mode.NORMAL);
    }
  }

  changeNick(data) {
    if (data.oldnick === this.state.nick) {
      this.setState({nick: data.newnick});
      data.channels.push(rootBufferName);
    }
    data.channels.forEach(function (channel) {
      this.state.buffers.changeNick(channel, data.oldnick, data.newnick);
      this.setState({buffer: this.state.buffer});
    }.bind(this));
  }
}
