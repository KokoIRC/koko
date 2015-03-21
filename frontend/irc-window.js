var bridge = require('../bridge');
var Channels = require('./lib/channels');
var IrcChannelBar = require('./irc-channel-bar');
var React = require('react');

var IrcWindow = React.createClass({
  getInitialState: function () {
    return {
      channels: new Channels('~'),
    };
  },
  setWindowTitle: function (title) {
    document.getElementsByTagName('title')[0].innerText =
      'koko - ' + title;
  },
  render: function () {
    var data = this.props.data;

    this.setWindowTitle(data.server);

    return (
      <div>
        <IrcChannelBar channels={this.state.channels} />
        <div>{JSON.stringify(this.props.data)}</div>
      </div>
    );
  }
});

module.exports = IrcWindow;
