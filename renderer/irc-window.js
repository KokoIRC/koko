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

  componentDidMount() {
    bridge.on('message', function (data) {
      this.setState({
        buffers: this.state.buffers.to(data.to).send(data.nick, data.text)
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
        <TabNav buffers={this.state.buffers} />
        <BufferView buffers={this.state.buffers} />
      </div>
    );
  }
}
