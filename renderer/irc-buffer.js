import React from 'react';

export default class IrcBuffer extends React.Component {
  current() {
    return this.props.buffers.current();
  }

  logElement(log) {
    return (
      <li>
        <div>{log.datetime.toString()}</div>
        <div>{log.nick}</div>
        <div>{log.text}</div>
      </li>
    );
  }

  render() {
    return (
      <div>
        <ul>
          {this.current().logs.map(this.logElement)}
        </ul>
      </div>
    );
  }
}
