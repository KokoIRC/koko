export const Mode = {
  NORMAL: 0,
  INSERT: 1,
  SEARCH: 2,
  COMMAND: 3,
};

export default class ModeManager {
  constructor(initialMode) {
    this._mode = initialMode;
    this._onChange = null;
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
}
