import BrowserWindow = require('browser-window');
import Ipc = require('./ipc');
import irc = require('./irc');
import shell = require('shell');

class IrcWindow {
  private _window: BrowserWindow;
  ipc: Ipc;
  focused: boolean;

  constructor(url: string) {
    this._window = new BrowserWindow({width: 800, height: 600});

    this.ipc = new Ipc(this._window);

    this._window.loadUrl(url);
    this._window.on('closed', () => {
      this._window = null;
      IrcWindow.remove(this);
    });
    this._window.on('focus', () => {
      this.ipc.send('focus', {});
      IrcWindow.focus(this);
    });
    this._window.webContents.on('new-window', function (e, url) {
      shell.openExternal(url);
      e.preventDefault();
    });

    this.ipc.on('connect', (data) => {
      irc.connect(data, this.ipc);
    });

    this.focused = true;
    IrcWindow.focus(this);
  }

  focus() {
    this.focused = true;
  }

  blur() {
    this.focused = false;
  }

  static windows: IrcWindow[] = [];


  static create(url: string) {
    IrcWindow.windows.push(new IrcWindow(url));
  }

  static remove(wToRemove: IrcWindow) {
    IrcWindow.windows = IrcWindow.windows.filter(function (w, idx) {
      if (w === wToRemove) {
        delete IrcWindow.windows[idx];
        return false;
      } else {
        return true;
      }
    });
  }

  static focus(wToFocus: IrcWindow) {
    IrcWindow.windows.forEach(function (w) {
      if (wToFocus === w) {
        w.focus();
      } else {
        w.blur();
      }
    });
  }

  static currentBrowserWindow(): BrowserWindow {
    return IrcWindow.windows.filter(w => w.focused)[0]._window;
  }
}

export = IrcWindow;
