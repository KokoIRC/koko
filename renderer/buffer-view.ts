import _ = require('underscore');
import buf = require('./lib/buffers');
import imageLib = require('./lib/image');
import log = require('./lib/logs');
import moment = require('moment');
import Ps = require('perfect-scrollbar');
import React = require('react');
import shortcut = require('./lib/shortcut-manager');
import TypedReact = require('typed-react');

const D = React.DOM;

const followLogBuffer = 20;
const minimumScrollHeight = 10;

interface BufferViewProps {
  buffers: buf.Buffers;
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
    Ps.initialize(this.view());
    shortcut.Manager.on('scroll-down', this.scrollDown);
    shortcut.Manager.on('scroll-up', this.scrollUp);
    shortcut.Manager.on('scroll-top', this.scrollTop);
    shortcut.Manager.on('scroll-bottom', this.scrollBottom);
    shortcut.Manager.on('page-down', this.pageDown);
    shortcut.Manager.on('page-up', this.pageUp);
  }

  current(): buf.Buf {
    return this.props.buffers.current();
  }

  logElement(log: log.Log): React.ReactElement<any> {
    let datetime = moment(log.datetime).calendar();
    let className = 'log';
    if (log.adjecent) {
      className += ' adjecent';
    }

    let media = null;
    if (log.media) {
      switch (log.media.type) {
      case 'image':
        media = D.a({href: log.media.url, target: '_blank'},
                  D.img({src: log.media.url}));
        break;
      case 'youtube':
        let embedSrc = `https://www.youtube.com/embed/${log.media.uuid}?rel=0`;
        media = D.iframe({src: embedSrc, frameBorder: 0});
        break;
      }
    }

    return (
      D.li({key: log.id, className: className},
        D.div({className: 'info'},
          D.span({className: 'nick'}, log.nick),
          D.span({className: 'datetime'}, datetime)
        ),
        D.div({className: 'text', dangerouslySetInnerHTML: {__html: log.textEl}}),
        D.div({className: 'media'}, media)
      )
    );
  }

  componentWillUpdate(nextProps: BufferViewProps) {
    let view = this.view();
    let isAtBottom = view.scrollHeight - view.clientHeight - view.scrollTop < followLogBuffer;
    let isChanged = this.currentBuffer !== nextProps.buffers.current().name;
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
    Ps.update(this.view());

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

export = React.createFactory(TypedReact.createClass(BufferView));
