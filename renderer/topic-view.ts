import React = require('react');
import Topic = require('./lib/topic');
import TypedReact = require('typed-react');

const D = React.DOM;

interface TopicViewProps {
  topic: Topic;
}

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

class TopicView extends TypedReact.Component<TopicViewProps, {}> {
  render() {
    if (!this.props.topic) {
      return null;
    }

    return (
      D.div({id: 'topic-view'},
        this.topicElement()
      )
    );
  }

  topicElement(): React.ReactElement<any> {
    let urlMatch = urlRegex.exec(this.props.topic.text);
    if (urlMatch) {
      let index = urlMatch.index;
      let url = urlMatch[0];
      return D.span(null,
        this.props.topic.text.substring(0, index),
        D.a({target: '_blank', href: url}, url),
        this.props.topic.text.substring(index + url.length)
      );
    } else {
      return D.span(null, this.props.topic.text);
    }
  }
}

export = React.createFactory(TypedReact.createClass(TopicView));
