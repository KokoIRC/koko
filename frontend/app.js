var bridge = require('../bridge');
var React = require('react');
var ServerForm = require('./server-form');

var App = React.createClass({
  componentDidMount: function () {
    bridge.on('connected', function (data) {
      console.log(data);
    });
  },
  render: function () {
    return <ServerForm />;
  }
});

React.render(<App />, document.getElementById('app'));
