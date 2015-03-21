import bridge from '../common/bridge';
import IrcWindow from './irc-window';
import React from 'react';
import ServerForm from './server-form';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      connectionData: {}
    };
  }

  componentDidMount() {
    var that = this;
    bridge.on('connected', function (data) {
      that.setState({connected: true, connectionData: data});
    });
  }

  render() {
    return this.state.connected ?
      <IrcWindow data={this.state.connectionData} /> :
      <ServerForm />;
  }
};

React.render(<App />, document.getElementById('app'));
