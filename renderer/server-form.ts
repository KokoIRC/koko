import ipc = require('./lib/ipc');
import React = require('react');
import TypedReact = require('typed-react');

const D = React.DOM;

interface TextInputProps {
  name: string;
  defaultValue: string;
}

class TextInput extends TypedReact.Component<TextInputProps, {}> {
  render() {
    return D.input({type: 'text', name: this.props.name,
                    defaultValue: this.props.defaultValue,
                    onKeyDown: this.keydown});
  }
  keydown(e: React.KeyboardEvent) {
    e.stopPropagation();
  }
}

const TInput = React.createFactory(TextInput);

interface ServerFormProps {
  connect: (any) => void;
}

class ServerForm extends TypedReact.Component<ServerFormProps, {}> {
  render() {
    return (
      D.form({onSubmit: this.connect},
        D.p(null,
          'host: ',
          TInput({name: 'host', defaultValue: 'irc.hanirc.org'})),
        D.p(null,
          'port: ',
          TInput({name: 'port', defaultValue: '6667'})),
        D.p(null,
          'encoding: ',
          TInput({name: 'encoding', defaultValue: 'CP949'})),
        D.p(null,
          'nick: ',
          TInput({name: 'nick', defaultValue: 'noraesae'})),
        D.p(null,
          'username: ',
          TInput({name: 'username', defaultValue: 'noraesae'})),
        D.p(null,
          'realname: ',
          TInput({name: 'realname', defaultValue: 'noraesae'})),
        D.button(null, 'connect')
      )
    );
  }

  formToJSON(): any {
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
    ipc.send('connect', data);
  }
}

export = React.createFactory(TypedReact.createClass(ServerForm));
