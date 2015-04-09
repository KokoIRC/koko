import React from 'react';

export default class NameView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.names || this.props.names.length === 0) {
      return null;
    }

    return (
      <div id='name-view'>
        <ul>
        {this.names()}
        </ul>
      </div>
    );
  }

  names() {
    return this.props.names.map(function (name) {
      let cls = name.isMe ? 'me' : '';
      return (
        <li className={cls}>
          <span className='mode'>{name.mode}</span>
          <span className='name'>{name.name}</span>
        </li>
      );
    });
  }
}
