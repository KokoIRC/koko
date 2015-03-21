import bridge from '../common/bridge';
import React from 'react';

export default class IrcChannelBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let channelElements = this.props.channels.map(
      channel => <li>{channel.name}</li>);

    return (
      <div>
        <ul>{channelElements}</ul>
      </div>
    );
  }
}
