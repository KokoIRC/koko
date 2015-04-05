import shortcutManager from './shortcut-manager';

export const Mode = {
  NORMAL: 0,
  MESSAGE: 1,
  SEARCH: 2,
  COMMAND: 3,
  toString(mode) {
    switch (mode) {
      case Mode.NORMAL:
        return 'normal';
      case Mode.MESSAGE:
        return 'message';
      case Mode.SEARCH:
        return 'search';
      case Mode.COMMAND:
        return 'command';
      default:
        return null;
    }
  }
};

export default class ModeManager {
  constructor(initialMode) {
    this._mode = initialMode;
    this._onChange = null;

    this._attachHandler();
  }

  current() {
    return this._mode;
  }

  setMode(mode) {
    let previous = this._mode;
    this._mode = mode;
    setTimeout(this._onChange.bind(null, mode, previous), 0);
  }

  onChange(callback) {
    this._onChange = callback;
  }

  _attachHandler() {
    shortcutManager.on('message', function () {
      if (this.current() === Mode.NORMAL) {
        this.setMode(Mode.MESSAGE);
      }
    }.bind(this));
    shortcutManager.on('search', function () {
      if (this.current() === Mode.NORMAL) {
        this.setMode(Mode.SEARCH);
      }
    }.bind(this));
    shortcutManager.on('command', function () {
      if (this.current() === Mode.NORMAL) {
        this.setMode(Mode.COMMAND);
      }
    }.bind(this));
    shortcutManager.on('exit', function () {
      this.setMode(Mode.NORMAL);
    }.bind(this));
  }
}
