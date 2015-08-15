import React = require('react');
import Topic = require('./lib/topic');

interface TopicViewProps {
  topic: Topic;
}

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([^\s'"`]*)/;

class TopicView extends React.Component<TopicViewProps, {}> {
  render() {
    if (!this.props.topic) {
      return null;
    }

    return (
      <div id='topic-view'>
        {this.topicElement()}
      </div>
    );
  }

  topicElement(): React.ReactElement<any> {
    let urlMatch = urlRegex.exec(this.props.topic.text);
    if (urlMatch) {
      let index = urlMatch.index;
      let url = urlMatch[0];
      return (
        <span>
          {this.props.topic.text.substring(0, index)}
          <a target='_blank' href={url}>{url}</a>
          {this.props.topic.text.substring(index + url.length)}
        </span>
      );
    } else {
      return <span>{this.props.topic.text}</span>;
    }
  }
}

export = TopicView;
