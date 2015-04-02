import bridge from '../common/bridge';
import IrcWindow from './irc-window';
import React from 'react';
import ServerForm from './server-form';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      connectionData: {},
    };
  }

  componentDidMount() {
    bridge.on('error', function (err) {
      // FIXME
      console.error(JSON.stringify(err));
    });
  }

  connect(data) {
    this.setState({connected: true, connectionData: data});
  }

  render() {
    return this.state.connected ?
      <IrcWindow connectionData={this.state.connectionData} /> :
      <ServerForm connect={this.connect.bind(this)} />;
  }
};

React.render(<App />, document.getElementById('app'));
