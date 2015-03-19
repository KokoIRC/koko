var React = require('react');
var ServerForm = require('./server-form');

var App = React.createClass({
  render: function () {
    return <ServerForm />;
  }
});

React.render(<App />, document.getElementById('app'));
