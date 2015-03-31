import bridge from '../common/bridge';
import InputBox from './input-box';
import IrcWindow from './irc-window';
import ModeManager, {Mode} from './lib/mode-manager';
import React from 'react';
import ServerForm from './server-form';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.modeManager = new ModeManager(Mode.NORMAL);
    this.state = {
      connected: false,
      connectionData: {},
      mode: this.modeManager.current(),
    };
  }

  componentDidMount() {
    this.modeManager.onChange(function (to) {
      this.setState({mode: to});
    }.bind(this));
    bridge.on('error', function (err) {
      // FIXME
      console.error(JSON.stringify(err));
    });
  }

  connect(data) {
    this.setState({connected: true, connectionData: data});
  }

  render() {
    let mainView = this.state.connected ?
      <IrcWindow connectionData={this.state.connectionData} /> :
      <ServerForm connect={this.connect.bind(this)} />;
    return (
      <div>
        {mainView}
        <InputBox mode={this.state.mode} setMode={this.setMode.bind(this)} />
      </div>
    );
  }

  setMode(mode) {
    this.modeManager.setMode(mode);
  }
};

React.render(<App />, document.getElementById('app'));
