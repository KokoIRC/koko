import BrowserWindow from 'browser-window';
import Ipc from './ipc';
import * as irc from './irc';
import shell from 'shell';

let windows = [];

export default class IrcWindow {
  constructor(url) {
    this._window = new BrowserWindow({width: 800, height: 600});

    this.ipc = new Ipc(this._window);

    this._window.loadUrl(url);
    this._window.on('closed', function() {
      this._window = null;
      IrcWindow.remove(this);
    });
    this._window.on('focus', function () {
      this.ipc.send('focus', {});
      IrcWindow.focus(this);
    }.bind(this));
    this._window.webContents.on('new-window', function (e, url) {
      shell.openExternal(url);
      e.preventDefault();
    });

    this.ipc.on('connect', function (data) {
      irc.connect(data, this.ipc);
    }.bind(this));

    this.focused = true;
    IrcWindow.focus(this);
  }

  focus() {
    this.focused = true;
  }

  blur() {
    this.focused = false;
  }

  static create(url) {
    windows.push(new IrcWindow(url));
  }

  static remove(wToRemove) {
    windows = windows.filter(function (w, idx) {
      if (w === wToRemove) {
        delete windows[idx];
        return false;
      } else {
        return true;
      }
    });
  }

  static focus(wToFocus) {
    windows.forEach(function (w) {
      if (wToFocus === w) {
        w.focus();
      } else {
        w.blur();
      }
    });
  }

  static currentBrowserWindow() {
    return windows.filter(w => w.focused)[0]._window;
  }
}
