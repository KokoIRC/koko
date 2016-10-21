import _ = require('underscore');
import Autocompleter = require('./lib/autocompleter');
import configuration = require('./lib/configuration');
import InputHistory = require('./lib/input-history');
import ipc = require('./lib/ipc');
import Name = require('./lib/name');
import React = require('react');
import ReactDOM = require('react-dom');
import ReactComponent = require('./lib/react-component');
import shortcut = require('./lib/shortcut-manager');

const rootBufferName = configuration.get('app', 'root-buffer-name');
const commandSymbol = configuration.get('app', 'command-symbol');

interface InputBoxProps {
  names: Name[];
  channel: string;
  submit: (text: string) => void;
}

class InputBox extends ReactComponent<InputBoxProps, {}> {
  inputHistory: InputHistory;
  autocompleter: Autocompleter;

  constructor() {
    super();
    this.inputHistory = new InputHistory();
    this.autocompleter = new Autocompleter();
  }

  componentDidMount() {
    shortcut.Manager.on('message', this.onMessageKey);
    shortcut.Manager.on('command', this.onCommandKey);
    shortcut.Manager.on('exit', this.onExitKey);
    shortcut.Manager.on('input-history-back', () => this.onInputHistoryKey(+1));
    shortcut.Manager.on('input-history-forward', () => this.onInputHistoryKey(-1));
    shortcut.Manager.on('autocomplete', this.onAutocompleteKey);

    // window events
    window.addEventListener('click', this.focus);
    ipc.on('focus', this.focus);
    ipc.on('blur', this.blur);
  }

  onMessageKey() {
    let input = ReactDOM.findDOMNode<HTMLInputElement>(this.refs['input']);
    if (input.value.startsWith(commandSymbol)) {
      input.value = '';
    }
    this.focus();
  }

  onCommandKey() {
    let input = ReactDOM.findDOMNode<HTMLInputElement>(this.refs['input']);
    if (!input.value.startsWith(commandSymbol)) {
      input.value = commandSymbol;
    }
    this.focus();
  }

  onExitKey() {
    this.blur();
  }

  onInputHistoryKey(idxDiff: number) {
    let input = ReactDOM.findDOMNode<HTMLInputElement>(this.refs['input']);
    if ((input as any).matches(':focus')) {
      if (this.inputHistory.index() < 0) {
        this.inputHistory.setTempInput(input.value);
      }
      this.inputHistory.moveIndex(idxDiff);
      input.value = this.inputHistory.currentText();
    }
  }

  onAutocompleteKey() {
    let input = ReactDOM.findDOMNode<HTMLInputElement>(this.refs['input']);
    let value = input.value;
    if ((input as any).matches(':focus') && value.length > 0) {
      let caretIdx = input.selectionStart;
      let wordIdx = value.lastIndexOf(' ', caretIdx - 1) + 1;
      let word = value.substring(wordIdx, caretIdx);

      if (word) {
        this.autocompleter.setNames(this.props.names.map(n => n.nick));
        let wordToReplace = this.autocompleter.complete(word);
        if (wordToReplace) {
          input.value = value.substring(0, wordIdx) + wordToReplace + value.substring(caretIdx);
          let newCaretIdx = wordIdx + wordToReplace.length;
          input.setSelectionRange(newCaretIdx, newCaretIdx);
        }
      }
    }
  }

  render() {
    return (
      <div id='input-box'>
        <form onSubmit={this.submit}>
          <input ref='input' type='text' onKeyDown={this.keyDown} />
        </form>
      </div>
    );
  }

  shouldComponentUpdate(nextProps: InputBoxProps): boolean {
    let input = ReactDOM.findDOMNode<HTMLInputElement>(this.refs['input']);
    return !(input as any).matches(':focus');
  }

  submit(e: React.FormEvent) {
    e.preventDefault();
    let input = ReactDOM.findDOMNode<HTMLInputElement>(this.refs['input']);
    let inputValue = input.value;
    if (inputValue.length > 0) {
      this.props.submit(inputValue);
      this.inputHistory.add(inputValue);
      this.inputHistory.reset();
    }
    input.value = '';
    this.autocompleter.reset();
  }

  focus() {
    let input = ReactDOM.findDOMNode<HTMLInputElement>(this.refs['input']);
    input.focus();
  }

  blur() {
    let input = ReactDOM.findDOMNode<HTMLInputElement>(this.refs['input']);
    input.blur();
  }

  keyDown(e: React.KeyboardEvent) {
    let nativeEvent = e.nativeEvent as KeyboardEvent;
    let modified = _.some(['Alt', 'Control', 'Meta', 'Shift'], e.getModifierState.bind(e));
    let special = _.contains(_.keys(shortcut.specialKeys), nativeEvent.key);
    let arrow = _.contains(['Up', 'Down'], nativeEvent.key);
    if (!(modified || special || arrow)) {
      e.stopPropagation();
    }

    if (nativeEvent.key === _.invert(shortcut.specialKeys)['tab']) {
      e.preventDefault();
    } else {
      this.autocompleter.reset();
    }
  }
}

export = InputBox;
