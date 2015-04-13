import _ from 'underscore';
import React from 'react';
import {Mode} from './lib/mode-manager';
import moment from 'moment';
import Ps from 'perfect-scrollbar';
import shortcutManager from './lib/shortcut-manager';

const followLogBuffer = 20;
const minimumScrollHeight = 10;

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
    shortcutManager.on('scroll-down', this.scrollDown.bind(this));
    shortcutManager.on('scroll-up', this.scrollUp.bind(this));
    shortcutManager.on('scroll-top', this.scrollTop.bind(this));
    shortcutManager.on('scroll-bottom', this.scrollBottom.bind(this));
    shortcutManager.on('page-down', this.pageDown.bind(this));
    shortcutManager.on('page-up', this.pageUp.bind(this));
  }

  current() {
    return this.props.buffers.current();
  }

  logElement(log) {
    let datetime = moment(log.datetime).calendar();
    let className = 'log';
    if (log.adjecent) {
      className += ' adjecent';
    }
    return (
      <li className={className}>
        <div className='info'>
          <span className='nick'>{log.nick}</span>
          <span className='datetime'>{datetime}</span>
        </div>
        <div className='text' dangerouslySetInnerHTML={{__html: log.textEl}}></div>
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

  scrollDown() {
    if (this.props.mode === Mode.NORMAL) {
      let view = this.view();
      let logs = _.toArray(view.getElementsByTagName('li'));

      let logToScroll = null;
      for (let log of logs) {
        if (log.offsetTop < view.scrollTop - minimumScrollHeight) {
          logToScroll = log;
        } else {
          break;
        }
      }
      let scrollTop = logToScroll ? logToScroll.offsetTop : 0;
      view.scrollTop = scrollTop;
    }
  }

  scrollUp() {
    if (this.props.mode === Mode.NORMAL) {
      let view = this.view();
      let logs = _.toArray(view.getElementsByTagName('li'));

      let logToScroll = null;
      for (let log of logs) {
        if (log.offsetTop > view.scrollTop + minimumScrollHeight) {
          logToScroll = log;
          break;
        }
      }
      let scrollTop = logToScroll ? logToScroll.offsetTop : 0;
      view.scrollTop = scrollTop;
    }
  }

  scrollTop() {
    if (this.props.mode === Mode.NORMAL) {
      let view = this.view();
      view.scrollTop = 0;
    }
  }

  scrollBottom() {
    if (this.props.mode === Mode.NORMAL) {
      let view = this.view();
      view.scrollTop = view.scrollHeight;
    }
  }

  pageDown() {
    if (this.props.mode === Mode.NORMAL) {
      let view = this.view();
      view.scrollTop = view.scrollTop + view.clientHeight;
    }
  }

  pageUp() {
    if (this.props.mode === Mode.NORMAL) {
      let view = this.view();
      view.scrollTop = view.scrollTop - view.clientHeight;
    }
  }
}
