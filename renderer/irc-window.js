import bridge from '../common/bridge';
import Buffers from './lib/buffers';
import BufferView from './buffer-view';
import InputBox from './input-box';
import ModeManager, {Mode} from './lib/mode-manager';
import TabNav from './tab-nav';
import React from 'react';

export default class IrcWindow extends React.Component {
  constructor(props) {
    super(props);
    this.modeManager = new ModeManager(Mode.NORMAL);
    this.state = {
      buffers: new Buffers('~'),
      mode: this.modeManager.current(),
    };
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

    bridge.on('message', this.setBuffers(data =>
      this.state.buffers.send(data.to, data.nick, data.text)));
    bridge.on('join', this.setBuffers(data =>
      this.state.buffers.join(data.channel, data.nick, data.message,
                              data.nick === this.props.connectionData.nick))); // FIXME
    bridge.on('part', this.setBuffers(data =>
      this.state.buffers.part(data.channel, data.nick, data.reason, data.message,
                              data.nick === this.props.connectionData.nick))); // FIXME
  }

  setWindowTitle(title) {
    let titleTag = document.getElementsByTagName('title')[0];
    titleTag.innerText = `koko - ${title}`;
  }

  render() {
    let connectionData = this.props.connectionData;

    this.setWindowTitle(connectionData.server);

    return (
      <div>
        <TabNav buffers={this.state.buffers} />
        <BufferView buffers={this.state.buffers} />
        <InputBox mode={this.state.mode} submit={this.submitInput.bind(this)} />
      </div>
    );
  }


  setMode(mode) {
  }

  submitInput(raw) {
    let target = this.state.buffers.current().name;
    bridge.send(Mode.toString(this.state.mode), {
      raw,
      context: {target},
    });

    if (this.state.mode !== Mode.MESSAGE) {
      this.modeManager.setMode(Mode.NORMAL);
    } else {
      // FIXME: nick
      this.state.buffers.send(target, this.props.connectionData.nick, raw);
      this.setState({buffer: this.state.buffer});
    }
  }
}
