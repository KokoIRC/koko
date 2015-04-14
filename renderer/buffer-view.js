import _ from 'underscore';
import imageLib from './lib/image';
import React from 'react';
import moment from 'moment';
import Ps from 'perfect-scrollbar';
import shortcutManager from './lib/shortcut-manager';

const followLogBuffer = 20;
const minimumScrollHeight = 10;
const shell = _require('shell');

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

    let media = null;
    if (log.media) {
      switch (log.media.type) {
      case 'image':
        media = <a href={log.media.url} target='_blank'><img src={log.media.url} /></a>;
        break;
      case 'youtube':
        let embedSrc = `https://www.youtube.com/embed/${log.media.uuid}?rel=0`;
        media = <iframe src={embedSrc} frameBorder="0"></iframe>
        break;
      }
    }

    return (
      <li className={className}>
        <div className='info'>
          <span className='nick'>{log.nick}</span>
          <span className='datetime'>{datetime}</span>
        </div>
        <div className='text' dangerouslySetInnerHTML={{__html: log.textEl}}></div>
        <div className='media'>
          {media}
        </div>
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

    this.loadImages();
  }

  scrollDown() {
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

  scrollUp() {
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

  scrollTop() {
    let view = this.view();
    view.scrollTop = 0;
  }

  scrollBottom() {
    let view = this.view();
    view.scrollTop = view.scrollHeight;
  }

  pageDown() {
    let view = this.view();
    view.scrollTop = view.scrollTop + view.clientHeight;
  }

  pageUp() {
    let view = this.view();
    view.scrollTop = view.scrollTop - view.clientHeight;
  }

  loadImages() {
    let view = this.view();
    let images = view.getElementsByTagName('img');
    Array.prototype.forEach.call(images, function (image) {
      if (!image.classList.contains('loaded')) {
        imageLib.getMeta(image.src, function (width, height) {
          let maxWidth = parseInt(image.parentElement.clientWidth, 10);
          let maxHeight = parseInt(getComputedStyle(image).maxHeight, 10);
          if (maxWidth < width) {
            height = height * maxWidth / width;
            width = maxWidth;
          }
          if (maxHeight < height) {
            width = width * maxHeight / height;
            height = maxHeight;
          }
          image.style.width = width + 'px';
          image.style.height = height + 'px';
          image.classList.add('loaded');
          if (this.isFollowingLog) {
            view.scrollTop += height;
          }
        }.bind(this), function () {
          image.remove();
        });
      }
    }.bind(this));
  }
}
