import AppErrorHandler = require('./lib/app-error-handler');
const {ipcRenderer} = require('electron');
import IrcView = require('./irc-view');
import shortcut = require('./lib/shortcut-manager');
import React = require('react');
import ReactDOM = require('react-dom');
import ReactComponent = require('./lib/react-component');
import ServerForm = require('./server-form');

interface AppState {
  connected: boolean;
  title: string;
}

class App extends ReactComponent<{}, AppState> {
  errorHandler: AppErrorHandler;

  constructor() {
    super();
    this.errorHandler = new AppErrorHandler();
    shortcut.Manager.initialize();
  }

  initialState(): AppState {
    return {
      connected: false,
      title: 'Koko'
    };
  }

  componentDidMount() {
    ipcRenderer.on('error', (data) => this.errorHandler.handle(data));
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
      <IrcView errorHandler={this.errorHandler} /> :
      <ServerForm connect={this.connect} />;
  }
};

ReactDOM.render(<App />,
             document.getElementById('app'));
