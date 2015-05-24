import React = require('react');
import TypedReact = require('typed-react');

const D = React.DOM;

interface SelectProps {
  name: string;
  options: string[];
  onChange: (newValue: string) => void;
}

interface SelectState {
  value: string;
}

class Select extends TypedReact.Component<SelectProps, SelectState> {
  getInitialState() {
    let options = this.props.options;
    let initialValue = options.length > 0 ? options[0] : '';
    return {value: initialValue};
  }

  options() {
    return this.props.options
      .sort(options => {
        return options === this.state.value ? 0 : 1;
      })
      .map((option, key) => {
        let className = 'option';
        if (option === this.state.value) {
          className += ' current';
        }
        return D.div({key, className, onClick: this.onChange}, option);
      });
  }

  render() {
    return (
      D.div({ref: 'select', className: 'select', onClick: this.onClick},
        D.div({className: 'arrow'}, '▾'),
        D.div({className: 'label'}, this.state.value),
        D.input({type: 'hidden', name: this.props.name, value: this.state.value}),
        D.div({className: 'option-wrapper'}, this.options())
      )
    );
  }

  node(): HTMLDivElement {
    return React.findDOMNode<HTMLDivElement>(this.refs['select']);
  }

  onChange(e) {
    let value = e.target.textContent;
    this.setState({value});
    this.props.onChange(value);
    this.node().classList.remove('selecting');
    e.stopPropagation();
  }

  onClick() {
    this.node().classList.add('selecting');
  }
}

export = React.createFactory(TypedReact.createClass(Select));
