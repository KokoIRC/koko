var bridge = require('../bridge');
var React = require('react');

var IrcWindow = React.createClass({
  render: function () {
    return (
      <div>{JSON.stringify(this.props.data)}</div>
    );
  }
});

module.exports = IrcWindow;
