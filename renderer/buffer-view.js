import React from 'react';
import moment from 'moment';

export default class BufferView extends React.Component {
  constructor(props) {
    super(props);
    this.isFollowingLog = true;
  }

  current() {
    return this.props.buffers.current();
  }

  processText(text) {
    let result = <span>{text}</span>;
    if (text.indexOf('\n') >= 0) {
      result = text.split('\n').reduce(function (result, line, idx) {
        if (idx > 0) {
          result.push(<br />);
        }
        result.push(<span>{line}</span>);
        return result;
      }, []);
    }
    return result;
  }

  logElement(log) {
    var datetime = moment(log.datetime).calendar();
    return (
      <li>
        <div className='info'>
          <span className='nick'>{log.nick}</span>
          <span className='datetime'>{datetime}</span>
        </div>
        <div className='text'>{this.processText(log.text)}</div>
      </li>
    );
  }

  componentWillUpdate() {
    let body = document.body;
    this.isFollowingLog = body.scrollHeight - body.scrollTop === body.clientHeight;
  }

  render() {
    return (
      <div id='buffer-view'>
        <ul>
          {this.current().logs.map(this.logElement.bind(this))}
        </ul>
      </div>
    );
  }

  componentDidUpdate() {
    if (this.isFollowingLog) {
      let body = document.body;
      body.scrollTop = body.scrollHeight;
    }
  }
}
