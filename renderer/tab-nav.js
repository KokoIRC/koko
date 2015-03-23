import bridge from '../common/bridge';
import React from 'react';

export default class TabNav extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let tabs = this.props.buffers.map(
      buffer => <li>{buffer.name}</li>);

    return (
      <div>
        <ul>{tabs}</ul>
      </div>
    );
  }
}
