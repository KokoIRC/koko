import bridge from '../bridge';
import React from 'react';

export default class IrcChannelBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var channelElements = this.props.channels.map(
      channel => <li>{channel.name}</li>);

    return (
      <div>
        <ul>{channelElements}</ul>
      </div>
    );
  }
}
