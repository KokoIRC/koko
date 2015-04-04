import bridge from '../common/bridge';
import {Mode} from './lib/mode-manager';
import React from 'react';

export default class InputBox extends React.Component {
  render() {
    let mode = this.props.mode;
    let inputDisabled = (mode === Mode.NORMAL);

    return (
      <div id='input-box'>
        <form onSubmit={this.submit.bind(this)}>
          <input ref='input' type='text' disabled={inputDisabled}
                 onBlur={this.blur.bind(this)} />
        </form>
      </div>
    );
  }

  componentDidUpdate() {
    let input = React.findDOMNode(this.refs.input);
    if (this.props.mode !== Mode.NORMAL) {
      if (this.previousMode !== this.props.mode) {
        input.value = '';
        this.previousMode = this.props.mode;
      }
      input.focus();
    } else {
      input.blur();
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.mode !== Mode.NORMAL) {
      let input = React.findDOMNode(this.refs.input);
      return !input.matches(':focus');
    }
    return true;
  }

  submit(e) {
    e.preventDefault();
    let input = React.findDOMNode(this).querySelector('input');
    let inputValue = input.value;
    if (this.props.mode === Mode.COMMAND) {
      inputValue = inputValue.trim();
    }
    if (inputValue.length > 0) {
      this.props.submit(inputValue);
    }
    input.value = '';
  }

  blur() {
    let input = React.findDOMNode(this).querySelector('input');
    this.props.blur();
  }
}
