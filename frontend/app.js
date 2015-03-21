var bridge = require('../bridge');
var IrcWindow = require('./irc-window');
var React = require('react');
var ServerForm = require('./server-form');

var App = React.createClass({
  getInitialState: function () {
    return {
      connected: false,
      connectionData: {}
    };
  },
  componentDidMount: function () {
    var that = this;
    bridge.on('connected', function (data) {
      that.setState({connected: true, connectionData: data});
    });
  },
  render: function () {
    return this.state.connected ?
      <IrcWindow data={this.state.connectionData} /> :
      <ServerForm />;
  }
});

React.render(<App />, document.getElementById('app'));
