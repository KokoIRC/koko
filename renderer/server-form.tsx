import ipc = require('./lib/ipc');
import configuration = require('./lib/configuration');
import React = require('react');
import Select = require('./select');
import TypedReact = require('typed-react');

const D = React.DOM;

const user = configuration.getConfig('user') || {};
const servers = configuration.getConfig('servers') || [];
const serverDefaults = configuration.get('defaults', 'server');

function getServer(name: string): IServerInterface {
  return servers.filter(s => s.name === name)[0];
}

interface ServerFormProps {
  connect: (any) => void;
}

class ServerForm extends TypedReact.Component<ServerFormProps, {}> {
  private server: IServerInterface;

  constructor() {
    super();
    this.server = servers[0] || {};
  }

  onChange(newValue: string) {
    this.server = getServer(newValue);
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
    let select = servers.length > 0 ?
                 Select({name: 'name', onChange: this.onChange,
                         options: servers.map(s => s.name)}) :
                 null;
    return (
      D.div({id: 'server-form'},
        D.div({className: 'logo'},
          D.div({className: 'logo-wrapper'},
            D.img({src: 'resource/image/logo.png'}),
            D.div(null, 'ココ'))),
        D.div({className: 'form-wrapper'},
          D.form({onSubmit: this.connect},
            select,
            D.div(null,
              D.div({className: 'field-name'}, 'Host'),
              D.input({type: 'text', name: 'host', ref: 'host'})),
            D.div(null,
              D.div({className: 'field-name'}, 'Port'),
              D.input({type: 'text', name: 'port', ref: 'port'})),
            D.div(null,
              D.div({className: 'field-name'}, 'Encoding'),
              D.input({type: 'text', name: 'encoding', ref: 'encoding'})),
            D.div(null,
              D.div({className: 'field-name'}, 'Nick'),
              D.input({type: 'text', name: 'nick', ref: 'nick'})),
            D.div(null,
              D.div({className: 'field-name'}, 'Username'),
              D.input({type: 'text', name: 'username', ref: 'username'})),
            D.div(null,
              D.div({className: 'field-name'}, 'Real Name'),
              D.input({type: 'text', name: 'realname', ref: 'realname'})),
            D.button(null, 'Connect')
          ))
      )
    );
  }

  formToJSON(): any {
    let form = React.findDOMNode(this);
    let inputs = form.querySelectorAll('input');
    let result = Array.prototype.reduce.call(inputs, function (obj, input) {
      obj[input.name] = input.value;
      return obj;
    }, {});

    if (result.name && getServer(result.name).host !== result.host) {
      // user may re-input the host, so the name may be wrong
      delete result.name;
    }

    return result;
  }

  connect(e) {
    e.preventDefault();

    let data = this.formToJSON();
    this.props.connect(data);
    ipc.send('connect', data);
  }
}

export = React.createFactory(TypedReact.createClass(ServerForm));
