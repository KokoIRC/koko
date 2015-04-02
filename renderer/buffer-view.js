import React from 'react';
import moment from 'moment';
import Ps from 'perfect-scrollbar';

const followLogBuffer = 20;

export default class BufferView extends React.Component {
  constructor(props) {
    super(props);
    this.isFollowingLog = true;
    this.currentBuffer = null;
  }

  view() {
    return React.findDOMNode(this.refs.view);
  }

  componentDidMount() {
    Ps.initialize(this.view());
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

  componentWillUpdate(nextProps) {
    let view = this.view();
    let isAtBottom = view.scrollHeight - view.clientHeight - view.scrollTop < followLogBuffer;
    let isChanged = this.currentBuffer !== nextProps.buffers.current().name;
    this.isFollowingLog = isAtBottom || isChanged;
  }

  render() {
    this.currentBuffer = this.current().name;
    return (
      <div id='buffer-view' ref='view'>
        <ul>
          {this.current().logs.map(this.logElement.bind(this))}
        </ul>
      </div>
    );
  }

  componentDidUpdate() {
    if (this.isFollowingLog) {
      let view = this.view();
      view.scrollTop = view.scrollHeight;
    }
    Ps.update(this.view());
  }
}
