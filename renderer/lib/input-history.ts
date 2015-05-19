import _ = require('underscore');
import configuration = require('./configuration');
import React = require('react');

const inputHistoryLimit = configuration.get('app', 'input-history-limit');

class InputHistory {
  private _history: string[];
  private _idx: number;
  private _tempInput: string;

  constructor() {
    this._history = [];
    this._idx = -1; // -1 is the initial index
    this._tempInput = '';
  }

  index(): number {
    return this._idx;
  }

  moveIndex(diff: number) {
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

  currentText(): string {
    if (this._idx < 0) {
      return this._tempInput;
    } else {
      return this._history[this._idx];
    }
  }

  setTempInput(tempInput: string) {
    this._tempInput = tempInput;
  }

  add(text: string) {
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

export = InputHistory;
