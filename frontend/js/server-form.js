var React = require('react');

var ServerForm = React.createClass({
  render: function () {
    return (
      <div>
        <p>server: <input type='text' name='server' defaultValue='irc.freenode.net' /></p>
        <p>port: <input type='text' name='port' defaultValue='6667' /></p>
        <p>nickname: <input type='text' name='nickname' defaultValue='noraesae' /></p>
        <p>login name: <input type='text' name='loginName' defaultValue='noraesae' /></p>
        <p>real name: <input type='text' name='realName' defaultValue='noraesae' /></p>
        <p><button>connect</button></p>
      </div>
    );
  }
});

module.exports = ServerForm;
