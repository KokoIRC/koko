import buf = require('./lib/buffers');
import React = require('react');
import TypedReact = require('typed-react');

const D = React.DOM;

interface TabNavProps {
  buffers: buf.Buffers;
}

class TabNav extends TypedReact.Component<TabNavProps, {}> {
  render() {
    let tabs = this.props.buffers.map(buffer =>
      D.li({className: buffer.current() ? 'current': ''}, buffer.name));

    return (
      D.div({id: 'tab-nav'},
        D.ul(null, tabs)
      )
    );
  }
}

export = React.createFactory(TypedReact.createClass(TabNav));
