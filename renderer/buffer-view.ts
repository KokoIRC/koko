import _ = require('underscore');
import Channel = require('./lib/channel');
import imageLib = require('./lib/image');
import Log = require('./lib/log');
import moment = require('moment');
import React = require('react');
import shortcut = require('./lib/shortcut-manager');
import TypedReact = require('typed-react');

const D = React.DOM;

const followLogBuffer = 20;
const minimumScrollHeight = 10;

interface BufferViewProps {
  channels: Channel[];
}

class BufferView extends TypedReact.Component<BufferViewProps, {}> {
  isFollowingLog: boolean;
  currentBuffer: string;

  constructor() {
    super();
    this.isFollowingLog = true;
    this.currentBuffer = null;
  }

  view(): HTMLDivElement {
    return React.findDOMNode<HTMLDivElement>(this.refs['view']);
  }

  componentDidMount() {
    shortcut.Manager.on('scroll-down', this.scrollDown);
    shortcut.Manager.on('scroll-up', this.scrollUp);
    shortcut.Manager.on('scroll-top', this.scrollTop);
    shortcut.Manager.on('scroll-bottom', this.scrollBottom);
    shortcut.Manager.on('page-down', this.pageDown);
    shortcut.Manager.on('page-up', this.pageUp);
  }

  current(): Channel {
    return Channel.current(this.props.channels);
  }

  logElement(log: Log): React.ReactElement<any> {
    let datetime = moment(log.datetime).calendar();
    let className = 'log';
    if (log.adjecent) {
      className += ' adjecent';
    }

    return (
      D.li({key: log.id, className: className},
        D.div({className: 'info'},
          D.span({className: 'nick'}, log.nick),
          D.span({className: 'datetime'}, datetime)
        ),
        log.content
      )
    );
  }

  componentWillUpdate(nextProps: BufferViewProps) {
    let view = this.view();
    let isAtBottom = view.scrollHeight - view.clientHeight - view.scrollTop < followLogBuffer;
    let isChanged = this.currentBuffer !== Channel.current(nextProps.channels).name;
    this.isFollowingLog = isAtBottom || isChanged;
  }

  render() {
    this.currentBuffer = this.current().name;
    return (
      D.div({id: 'buffer-view', ref: 'view'},
        D.ul(null, this.current().logs.map(this.logElement))
      )
    );
  }

  componentDidUpdate() {
    if (this.isFollowingLog) {
      let view = this.view();
      view.scrollTop = view.scrollHeight;
    }

    this.loadImages();
  }

  scrollDown() {
    let view = this.view();
    let logs = _.toArray<HTMLLIElement>(view.getElementsByTagName('li'));

    let logToScroll = null;
    for (let i = 0; i < logs.length; i++) {
      let log = logs[i];
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
    let logs = _.toArray<HTMLLIElement>(view.getElementsByTagName('li'));

    let logToScroll = null;
    for (let i = 0; i < logs.length; i++) {
      let log = logs[i];
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
    Array.prototype.forEach.call(images, (image) => {
      if (!image.classList.contains('loaded')) {
        imageLib.getMeta(image.src, (width, height) => {
          let mediaElement = image.parentElement.parentElement;
          let maxWidth = parseInt(mediaElement.clientWidth, 10);
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
            view.scrollTop += mediaElement.offsetHeight;
          }
        }, function () {
          image.remove();
        });
      }
    });
  }
}

export = React.createFactory(TypedReact.createClass(BufferView));
