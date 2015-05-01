import _ = require('underscore');
import Color = require('./lib/irc-color');
import React = require('react');
import TypedReact = require('typed-react');

const D = React.DOM;

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([^\s'"`]*)/g;
const youtubeRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/g;

interface LogContentProps {
  text: string;
}

interface Media {
  type: string;
  uuid?: string;
  url?: string;
}

class LogContent extends TypedReact.Component<LogContentProps, {}> {
  media: Media
  render() {
    return (
      D.div(null,
        D.div({className: 'text'}, this.textNode()),
        D.div({className: 'media'}, this.mediaNode())
      )
    );
  }

  textNode(): React.ReactElement<any>[] {
    let lines = this.props.text.split("\n").map(line => {
      let colors = Color.parse(line);
      if (colors.length === 0) {
        return this.parseURL(line);
      } else {
        return this.coloredText(line, colors);
      }
    });

    return lines.reduce((result, line, idx) => {
      if (idx === lines.length - 1) {
        return result.concat(line);
      } else {
        return result.concat([line, D.br()]);
      }
    }, []);
  }

  subtractIdx(idx: number) {
    return color => {
      color.index -= idx;
      return color;
    }
  }

  coloredText(text: string, colors: Color[]): React.ReactElement<any> | string {
    let head = _.head(colors);
    let tail = _.tail(colors);
    if (!head) {
      return parseURL(text);
    } else {
      if (head.type === 'close') {
        return this.coloredText(text, tail);
      }

      let className;
      if (head.type === 'color') {
        className = head.color;
        if (head.bgColor) {
          className += ` bg-${head.bgColor}`;
        }
      } else {
        className = head.type;
      }

      let close;
      if (head.type === 'reverse') {
        close = _.find(tail, c => (c.type === 'close' || c.type === 'reverse'));
      } else {
        close = _.find(tail, c => c.type === 'close');
      }

      if (close) {
        let colorIdx = head.index + head.length;
        let closeIdx = close.index + close.length;
        return (
          D.span(null,
            this.parseURL(text.substring(0, head.index)),
            D.span({className},
              this.coloredText(text.substring(colorIdx, close.index),
                               _.first(tail, tail.indexOf(close)).map(this.subtractIdx(colorIdx)))
            ),
            this.coloredText(text.substring(closeIdx),
                             _.rest(tail, tail.indexOf(close) + 1).map(this.subtractIdx(closeIdx)))
          )
        );
      } else {
        let colorIdx = head.index + head.length;
        return (
          D.span(null,
            this.parseURL(text.substring(0, head.index)),
            D.span({className},
              this.coloredText(text.substring(head.index + head.length),
                               tail.map(this.subtractIdx(colorIdx)))
            )
          )
        );
      }
    }
  }

  parseURL(text: string): React.ReactElement<any> | string {
    // FIXME
    return text;
  }

  mediaNode(): React.ReactElement<any> {
    // FIXME
    return null;
  }
}

export = React.createFactory(TypedReact.createClass(LogContent));
