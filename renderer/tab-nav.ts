import Channel = require('./lib/channel');
import React = require('react');
import TypedReact = require('typed-react');

const D = React.DOM;

interface TabNavProps {
  channels: Channel[];
}

class TabNav extends TypedReact.Component<TabNavProps, {}> {
  render() {
    let tabs = this.props.channels.map(channel =>
      D.li({key: channel.id, className: channel.current ? 'current': ''}, channel.name));

    return (
      D.div({id: 'tab-nav'},
        D.ul(null, tabs)
      )
    );
  }
}

export = React.createFactory(TypedReact.createClass(TabNav));
