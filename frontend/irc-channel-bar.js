var bridge = require('../bridge');
var React = require('react');

var IrcChannelBar = React.createClass({
  render: function () {
    var channelElements = this.props.channels.map(function (channel) {
      return <li>{channel.name}</li>
    });
    return (
      <div>
        <ul>{channelElements}</ul>
      </div>
    );
  }
});

module.exports = IrcChannelBar;
