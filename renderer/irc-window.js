import bridge from '../bridge';
import Channels from './lib/channels';
import IrcChannelBar from './irc-channel-bar';
import React from 'react';

export default class IrcWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      channels: new Channels('~')
    };
  }

  setWindowTitle(title) {
    document.getElementsByTagName('title')[0].innerText =
      'koko - ' + title;
  }

  render() {
    var data = this.props.data;

    this.setWindowTitle(data.server);

    return (
      <div>
        <IrcChannelBar channels={this.state.channels} />
        <div>{JSON.stringify(this.props.data)}</div>
      </div>
    );
  }
}
