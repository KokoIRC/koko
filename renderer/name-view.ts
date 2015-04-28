import Name = require('./lib/name');
import React = require('react');
import TypedReact = require('typed-react');

const D = React.DOM;

interface NameViewProps {
  names: Name[];
}

class NameView extends TypedReact.Component<NameViewProps, {}> {
  render() {
    if (!this.props.names || this.props.names.length === 0) {
      return null;
    }

    return (
      D.div({id: 'name-view'},
        D.ul(null, this.names())
      )
    );
  }

  names() {
    return this.props.names.map(function (name) {
      let cls = name.isMe ? 'me' : '';
      return (
        D.li({key: name.nick, className: cls},
          D.span({className: 'mode'}, name.mode),
          D.span({className: 'nick'}, name.nick)
        )
      );
    });
  }
}

export = React.createFactory(TypedReact.createClass(NameView));
