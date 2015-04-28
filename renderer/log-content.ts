import _ = require('underscore');
import escapeHTML = require('escape-html');
import IrcColorParser = require('./lib/irc-color-parser');
import React = require('react');
import TypedReact = require('typed-react');

const D = React.DOM;

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([^\s'"`]*)/g;
const youtubeRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/g;

interface LogContentProps {
  text: string;
}

interface MediaLog {
  type: string;
  uuid?: string;
  url?: string;
}

class LogContent extends TypedReact.Component<LogContentProps, {}> {
  media: MediaLog
  render() {
    let text = this.processText(this.props.text);
    let media = null;
    if (this.media) {
      switch (this.media.type) {
      case 'image':
        media = D.a({href: this.media.url, target: '_blank'},
                  D.img({src: this.media.url}));
        break;
      case 'youtube':
        let embedSrc = `https://www.youtube.com/embed/${this.media.uuid}?rel=0`;
        media = D.iframe({src: embedSrc, frameBorder: 0});
        break;
      }
    }

    return (
      D.div(null,
        D.div({className: 'text', dangerouslySetInnerHTML: {__html: text}}),
        D.div({className: 'media'}, media)
      )
    );
  }

  processText(text: string): string {
    text = escapeHTML(text);
    text = this.processNewline(text);
    text = this.processColor(text);
    text = this.processURL(text);
    return text;
  }

  processNewline(text: string): string {
    return text.replace(/\n/g, '<br />');
  }

  processColor(text: string): string {
    let parser = new IrcColorParser(text);
    return parser.process();
  }

  processURL(text: string): string {
    let match;
    let result = text;
    while (match = urlRegex.exec(text)) {
      let url = match[0];
      let newContent = `<a href='${url}' target='_blank'>${url}</a>`;
      if (this.isImageURL(url)) {
        this.media = { type: 'image', url };
      } else if (match = youtubeRegex.exec(url)) {
        let uuid = match[1];
        this.media = { type: 'youtube', uuid };
      }
      result = result.replace(url, newContent);
    }
    return result;
  }

  isImageURL(url: string): boolean {
    const imageExts = ['.jpg', '.jpeg', '.png'];
    let lowerCasedURL = url;
    return _.some(imageExts, function (ext) {
      return lowerCasedURL.substring(lowerCasedURL.length - ext.length) === ext;
    });
  }
}

export = React.createFactory(TypedReact.createClass(LogContent));
