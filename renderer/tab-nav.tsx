import Channel = require('./lib/channel');
import React = require('react');
import ReactComponent = require('./lib/react-component');

interface TabNavProps {
  channels: Channel[];
}

class TabNav extends ReactComponent<TabNavProps, {}> {
  render() {
    let tabs = this.props.channels.map(channel => {
      let className = '';
      if (channel.current) {
        className += ' current';
      }
      if (channel.unread) {
        className += ' unread';
      }
      return <li key={channel.id} className={className}>{channel.name}</li>;
    });

    return (
      <div id='tab-nav'>
        <ul>{tabs}</ul>
      </div>
    );
  }
}

export = TabNav;
