import AppErrorHandler from './lib/app-error-handler';
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
    this.errorHandler = new AppErrorHandler();
    shortcutManager.initialize();
  }

  componentDidMount() {
    bridge.on('error', this.errorHandler.handle.bind(this.errorHandler));
  }

  connect(data) {
    this.setState({connected: true, server: data.server});
  }

  render() {
    return this.state.connected ?
      <IrcWindow server={this.state.server} errorHandler={this.errorHandler}/> :
      <ServerForm connect={this.connect.bind(this)} />;
  }
};

React.render(<App />, document.getElementById('app'));
