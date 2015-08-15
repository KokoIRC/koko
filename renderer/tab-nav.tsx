import Channel = require('./lib/channel');
import React = require('react');
import TypedReact = require('typed-react');

const D = React.DOM;

interface TabNavProps {
  channels: Channel[];
}

class TabNav extends TypedReact.Component<TabNavProps, {}> {
  render() {
    let tabs = this.props.channels.map(channel => {
      let className = '';
      if (channel.current) {
        className += ' current';
      }
      if (channel.unread) {
        className += ' unread';
      }
      return D.li({key: channel.id, className}, channel.name)
    });

    return (
      D.div({id: 'tab-nav'},
        D.ul(null, tabs)
      )
    );
  }
}

export = React.createFactory(TypedReact.createClass(TabNav));
