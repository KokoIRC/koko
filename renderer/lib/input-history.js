import _ from 'underscore';
import configuration from './configuration';

const inputHistoryLimit = configuration.get('input-history-limit');

export default class InputHistory {
  constructor(props) {
    super(props);

    this._history = [];
    this._idx = -1; // -1 is the initial index
    this._tempInput = '';
  }

  index() {
    return this._idx;
  }

  moveIndex(diff) {
    let originalIdx = this._idx;
    this._idx += diff;
    if (this._idx < 0) {
      this._idx = -1;
    } else if (this._idx >= inputHistoryLimit) {
      this._idx = inputHistoryLimit - 1;
    } else if (_.isUndefined(this._history[this._idx])) {
      this._idx = originalIdx; // rollback
    }
  }

  currentText() {
    if (this._idx < 0) {
      return this._tempInput;
    } else {
      return this._history[this._idx];
    }
  }

  setTempInput(tempInput) {
    this._tempInput = tempInput;
  }

  add(text) {
    this._history = [text].concat(this._history);
    if (this._history.length > inputHistoryLimit) {
      this._history = this._history.splice(0, inputHistoryLimit);
    }
  }

  reset() {
    this._tempInput = '';
    this._idx = -1;
  }
}
