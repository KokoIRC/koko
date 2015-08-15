import Name = require('./lib/name');
import React = require('react');
import ReactComponent = require('./lib/react-component');

interface NameViewProps {
  names: Name[];
}

class NameView extends ReactComponent<NameViewProps, {}> {
  render() {
    if (!this.props.names || this.props.names.length === 0) {
      return null;
    }

    return (
      <div id='name-view'>
        <ul>{this.names()}</ul>
      </div>
    );
  }

  names() {
    return this.props.names.map(function (name) {
      let cls = name.isMe ? 'me' : '';
      return (
        <li key={name.nick} className={cls} title={name.nick}>
          <span className='mode'>{name.mode}</span>
          <span className='nick'>{name.nick}</span>
        </li>
      );
    });
  }
}

export = NameView;
