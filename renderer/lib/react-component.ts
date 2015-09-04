import React = require('react');

class ReactComponent<Props, States> extends React.Component<Props, States> {
  constructor(props?: Props) {
    super(props);
    this.state = this.initialState();
    this.bindThisToMethods();
  }

  initialState(): States {
    return {} as States;
  }

  bindThisToMethods() {
    Object.getOwnPropertyNames(this.constructor.prototype)
      .filter(key => typeof this[key] === 'function')
      .forEach(key => this[key] = this[key].bind(this));
  }
}

export = ReactComponent;
