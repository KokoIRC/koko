import bridge from '../common/bridge';
import Channels from './lib/channels';
import IrcChannelBar from './irc-channel-bar';
import React from 'react';

export default class IrcWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      channels: new Channels('~'),
    };
  }

  componentDidMount() {
    bridge.on('message', function (data) {
      this.setState({
        channels: this.state.channels.to(data.channel).send(data.nick, data.text)
      });
    }.bind(this));
  }

  setWindowTitle(title) {
    let titleTag = document.getElementsByTagName('title')[0];
    titleTag.innerText = `koko - ${title}`;
  }

  render() {
    let connectionData = this.props.connectionData;

    this.setWindowTitle(connectionData.server);

    return (
      <div>
        <IrcChannelBar channels={this.state.channels} />
        <div>{JSON.stringify(connectionData)}</div>
      </div>
    );
  }
}
