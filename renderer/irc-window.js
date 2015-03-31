import bridge from '../common/bridge';
import Buffers from './lib/buffers';
import BufferView from './buffer-view';
import TabNav from './tab-nav';
import React from 'react';

export default class IrcWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buffers: new Buffers('~'),
    };
  }

  setBuffers(func) {
    return function (data) {
      func(data);
      this.setState({
        buffers: this.state.buffers
      });
    }.bind(this);
  }

  componentDidMount() {
    bridge.on('message', this.setBuffers(data =>
      this.state.buffers.send(data.to, data.nick, data.text)));
    bridge.on('join', this.setBuffers(data =>
      this.state.buffers.join(data.channel, data.nick, data.message,
                              data.nick === this.props.connectionData.nick))); // FIXME
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
        <TabNav buffers={this.state.buffers} />
        <BufferView buffers={this.state.buffers} />
      </div>
    );
  }
}
