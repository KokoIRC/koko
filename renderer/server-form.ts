import ipc = require('./lib/ipc');
import configuration = require('./lib/configuration');
import React = require('react');
import TypedReact = require('typed-react');

const D = React.DOM;

const user = configuration.getConfig('user') || {};
const servers = configuration.getConfig('servers') || [];
const serverDefaults = configuration.get('defaults', 'server');

interface ServerFormProps {
  connect: (any) => void;
}

class ServerForm extends TypedReact.Component<ServerFormProps, {}> {
  private server: ServerInterface;

  constructor() {
    super();
    this.server = servers[0] || {};
  }

  onChange(e) {
    let serverName = e.target.value;
    this.server = servers.filter(s => s.name === serverName)[0];

    this.applyValues();
  }

  val(field: string): string {
    return this.server[field] || user[field] || serverDefaults[field] || '';
  }

  applyValues() {
    let fields = ['host', 'port', 'encoding', 'nick', 'username', 'realname'];
    fields.forEach(fieldName => {
      React.findDOMNode<HTMLInputElement>(this.refs[fieldName]).value = this.val(fieldName);
    });
  }

  componentDidMount() {
    this.applyValues();
  }

  componentDidUpdate() {
    this.applyValues();
  }

  render() {
    return (
      D.form({onSubmit: this.connect},
        D.select({onChange: this.onChange},
          servers.map(s => D.option({value: s.name}, s.name))),
        D.p(null,
          'host: ',
          D.input({type: 'text', name: 'host', ref: 'host'})),
        D.p(null,
          'port: ',
          D.input({type: 'text', name: 'port', ref: 'port'})),
        D.p(null,
          'encoding: ',
          D.input({type: 'text', name: 'encoding', ref: 'encoding'})),
        D.p(null,
          'nick: ',
          D.input({type: 'text', name: 'nick', ref: 'nick'})),
        D.p(null,
          'username: ',
          D.input({type: 'text', name: 'username', ref: 'username'})),
        D.p(null,
          'realname: ',
          D.input({type: 'text', name: 'realname', ref: 'realname'})),
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
