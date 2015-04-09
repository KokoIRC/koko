import _ from 'underscore';
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
                 onBlur={this.blur.bind(this)}
                 onKeyDown={this.keyDown.bind(this)} />
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

  keyDown(e) {
    let modified = _.some(['Alt', 'Control', 'Meta', 'Shift'], e.getModifierState.bind(e));
    let special = _.contains(['U+001B', 'U+0020', 'U+0008', 'U+007F'], e.nativeEvent.keyIdentifier);
    if (!modified && !special) {
      e.stopPropagation();
    }
  }
}
