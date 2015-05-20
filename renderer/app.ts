import AppErrorHandler = require('./lib/app-error-handler');
import ipc = require('./lib/ipc');
import IrcView = require('./irc-view');
import shortcut = require('./lib/shortcut-manager');
import React = require('react');
import ServerForm = require('./server-form');
import TypedReact = require('typed-react');

const D = React.DOM;

interface AppState {
  connected: boolean;
  title: string;
}

class App extends TypedReact.Component<{}, AppState> {
  errorHandler: AppErrorHandler;

  constructor() {
    super();
    this.errorHandler = new AppErrorHandler();
    shortcut.Manager.initialize();
  }

  getInitialState(): AppState {
    return {
      connected: false,
      title: 'koko'
    };
  }

  componentDidMount() {
    ipc.on('error', (data) => this.errorHandler.handle(data));
  }

  connect(data) {
    this.setState({
      connected: true,
      title: data.name || data.host
    });
  }

  setWindowTitle() {
    let titleTag = document.querySelector('title');
    titleTag.textContent = this.state.title;
  }

  render() {
    this.setWindowTitle();
    return this.state.connected ?
      IrcView({errorHandler: this.errorHandler}) :
      ServerForm({connect: this.connect});
  }
};

React.render(React.createElement(TypedReact.createClass(App)),
             document.getElementById('app'));
