import bridge from '../common/bridge';
import React from 'react';

class TextInput extends React.Component {
  render() {
    return <input type='text' name={this.props.name}
                  defaultValue={this.props.defaultValue}
                  onKeyDown={this.keydown.bind(this)} />;
  }
  keydown(e) {
    e.stopPropagation();
  }
}

export default class ServerForm extends React.Component {
  render() {
    return (
      <form onSubmit={this.connect.bind(this)}>
        <p>server: <TextInput name='server' defaultValue='irc.hanirc.org' /></p>
        <p>port: <TextInput name='port' defaultValue='6667' /></p>
        <p>encoding: <TextInput name='encoding' defaultValue='CP949' /></p>
        <p>nickname: <TextInput name='nick' defaultValue='noraesae' /></p>
        <p>user name: <TextInput name='username' defaultValue='noraesae' /></p>
        <p>real name: <TextInput name='realname' defaultValue='noraesae' /></p>
        <p><button>connect</button></p>
      </form>
    );
  }

  formToJSON() {
    let form = React.findDOMNode(this);
    let inputs = form.querySelectorAll('input[type="text"]');
    return Array.prototype.reduce.call(inputs, function (obj, input) {
      obj[input.name] = input.value;
      return obj;
    }, {});
  }

  connect(e) {
    e.preventDefault();

    let data = this.formToJSON();
    this.props.connect(data);
    bridge.send('connect', data);
  }
}
