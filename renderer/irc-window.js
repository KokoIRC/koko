import bridge from '../common/bridge';
import Buffers from './lib/buffers';
import BufferView from './buffer-view';
import InputBox from './input-box';
import TabNav from './tab-nav';
import React from 'react';
import ModeManager, {Mode} from './lib/mode-manager';

export default class IrcWindow extends React.Component {
  constructor(props) {
    super(props);
    this.modeManager = new ModeManager(Mode.NORMAL);
    this.state = {
      buffers: new Buffers('~'),
      mode: this.modeManager.current(),
    };
  }

  componentDidMount() {
    bridge.on('message', function (data) {
      this.setState({
        buffers: this.state.buffers.to(data.to).send(data.nick, data.text)
      });
    }.bind(this));
    this.initializeModeManger();
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
        <InputBox mode={this.state.mode} setMode={this.setMode.bind(this)} />
      </div>
    );
  }

  initializeModeManger() {
    window.addEventListener('keydown', function (e) {
      var currentMode = this.modeManager.current();
      if (currentMode === Mode.NORMAL) {
        if (e.which === 73 && !e.shiftKey) { // 'i'
          this.setMode(Mode.INSERT);
        } else if (e.which === 191 && !e.shiftKey) { // '/'
          this.setMode(Mode.SEARCH);
        } else if (e.which === 186 && e.shiftKey) { // ':'
          this.setMode(Mode.COMMAND);
        }
      } else if (currentMode === Mode.INSERT) {
        if (e.which === 27) { // 'esc'
          this.setMode(Mode.NORMAL);
        }
      } else if (currentMode === Mode.SEARCH) {
        if (e.which === 27) { // 'esc'
          this.setMode(Mode.NORMAL);
        } else if (e.which === 73 && !e.shiftKey) { // 'i'
          this.setMode(Mode.INSERT);
        }
      } else if (currentMode === Mode.COMMAND) {
        if (e.which === 27) { // 'esc'
          this.setMode(Mode.NORMAL);
        }
      }
    }.bind(this));

    this.modeManager.onChange(function (to) {
      this.setState({mode: to});
    }.bind(this));
  }

  setMode(mode) {
    this.modeManager.setMode(mode);
  }
}
