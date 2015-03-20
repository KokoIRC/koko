var bridge = require('../../bridge');
var React = require('react');

var ServerForm = React.createClass({
  render: function () {
    return (
      <form onSubmit={this.connect}>
        <p>server: <input type='text' name='server' defaultValue='irc.freenode.net' /></p>
        <p>port: <input type='text' name='port' defaultValue='6667' /></p>
        <p>encoding: <input type='text' name='encoding' defaultValue='UTF-8' /></p>
        <p>nickname: <input type='text' name='nickname' defaultValue='noraesae' /></p>
        <p>login name: <input type='text' name='loginName' defaultValue='noraesae' /></p>
        <p>real name: <input type='text' name='realName' defaultValue='noraesae' /></p>
        <p><button>connect</button></p>
      </form>
    );
  },
  formToJSON: function () {
    var form = React.findDOMNode(this);
    var inputs = form.querySelectorAll('input[type="text"]');
    return Array.prototype.reduce.call(inputs, function (obj, input) {
      obj[input.name] = input.value;
      return obj;
    }, {});
  },
  connect: function (e) {
    e.preventDefault();

    bridge.send('connect', this.formToJSON());
  }
});

module.exports = ServerForm;
