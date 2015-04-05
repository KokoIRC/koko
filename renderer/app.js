import bridge from '../common/bridge';
import IrcWindow from './irc-window';
import shortcutManager from './lib/shortcut-manager';
import React from 'react';
import ServerForm from './server-form';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      connectionData: {},
    };
    shortcutManager.initialize();
  }

  componentDidMount() {
    bridge.on('error', function (err) {
      // FIXME
      console.error(JSON.stringify(err));
    });
  }

  connect(data) {
    this.setState({connected: true, server: data.server});
  }

  render() {
    return this.state.connected ?
      <IrcWindow server={this.state.server} /> :
      <ServerForm connect={this.connect.bind(this)} />;
  }
};

React.render(<App />, document.getElementById('app'));
