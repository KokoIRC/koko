import _ = require('underscore');
import Autocompleter = require('./lib/autocompleter');
import configuration = require('./lib/configuration');
import InputHistory = require('./lib/input-history');
import ipc = require('./lib/ipc');
import Name = require('./lib/name');
import React = require('react');
import shortcut = require('./lib/shortcut-manager');
import TypedReact = require('typed-react');

const D = React.DOM;

const rootBufferName = configuration.get('root-buffer-name');
const commandSymbol = configuration.get('command-symbol');

interface InputBoxProps {
  names: Name[];
  channel: string;
  submit: (text: string) => void;
}

class InputBox extends TypedReact.Component<InputBoxProps, {}> {
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
    ipc.on('focus', this.onFocusWindow);
  }

  onMessageKey() {
    let input = React.findDOMNode<HTMLInputElement>(this.refs['input']);
    if (input.value.startsWith(commandSymbol)) {
      input.value = '';
    }
    this.focus();
  }

  onCommandKey() {
    let input = React.findDOMNode<HTMLInputElement>(this.refs['input']);
    if (!input.value.startsWith(commandSymbol)) {
      input.value = commandSymbol;
    }
    this.focus();
  }

  onExitKey() {
    this.blur();
  }

  onInputHistoryKey(idxDiff: number) {
    let input = React.findDOMNode<HTMLInputElement>(this.refs['input']);
    if ((<any>input).matches(':focus')) {
      if (this.inputHistory.index() < 0) {
        this.inputHistory.setTempInput(input.value);
      }
      this.inputHistory.moveIndex(idxDiff);
      input.value = this.inputHistory.currentText();
    }
  }

  onAutocompleteKey() {
    let input = React.findDOMNode<HTMLInputElement>(this.refs['input']);
    let value = input.value;
    if ((<any>input).matches(':focus') && value.length > 0) {
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

  onFocusWindow() {
    if (this.props.channel !== rootBufferName) {
      this.focus();
    }
  }

  render() {
    return (
      D.div({id: 'input-box'},
        D.form({onSubmit: this.submit},
          D.input({ref: 'input', type: 'text', onKeyDown: this.keyDown})
        )
      )
    );
  }

  shouldComponentUpdate(nextProps: InputBoxProps): boolean {
    let input = React.findDOMNode<HTMLInputElement>(this.refs['input']);
    return !(<any>input).matches(':focus');
  }

  submit(e: React.FormEvent) {
    e.preventDefault();
    let input = React.findDOMNode<HTMLInputElement>(this.refs['input']);
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
    let input = React.findDOMNode<HTMLInputElement>(this.refs['input']);
    input.focus();
  }

  blur() {
    let input = React.findDOMNode<HTMLInputElement>(this.refs['input']);
    input.blur();
  }

  keyDown(e: React.KeyboardEvent) {
    let modified = _.some(['Alt', 'Control', 'Meta', 'Shift'], e.getModifierState.bind(e));
    let special = _.contains(_.keys(shortcut.specialKeys), e.nativeEvent.keyIdentifier);
    let arrow = _.contains(['Up', 'Down'], e.nativeEvent.keyIdentifier);
    if (!(modified || special || arrow)) {
      e.stopPropagation();
    }

    if (e.nativeEvent.keyIdentifier === _.invert(shortcut.specialKeys)['tab']) {
      e.preventDefault();
    } else {
      this.autocompleter.reset();
    }
  }
}

export = React.createFactory(TypedReact.createClass(InputBox));
