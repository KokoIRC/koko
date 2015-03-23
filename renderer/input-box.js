import bridge from '../common/bridge';
import React from 'react';

export default class InputBox extends React.Component {
  render() {
    return (
      <div id='input-box'>
        <form onSubmit={this.submit.bind(this)}>
          <input type='text' />
        </form>
      </div>
    );
  }

  submit(e) {
    e.preventDefault();
    let input = React.findDOMNode(this).querySelector('input');
    bridge.send('message', input.value);
    input.value = '';
  }
}
