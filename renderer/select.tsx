import React = require('react');
import ReactDOM = require('react-dom');
import ReactComponent = require('./lib/react-component');

interface SelectProps {
  name: string;
  options: string[];
  onChange: (newValue: string) => void;
}

interface SelectState {
  value: string;
}

class Select extends ReactComponent<SelectProps, SelectState> {
  initialState() {
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
        return (
          <div key={key} className={className}
              onClick={this.onChange}>
            {option}
          </div>
        );
      });
  }

  render() {
    return (
      <div ref='select' className='select' onClick={this.onClick}>
        <div className='arrow'>▾</div>
        <div className= 'label'>{this.state.value}</div>
        <input type='hidden' name={this.props.name} value={this.state.value} />
        <div className='option-wrapper'>{this.options()}</div>
      </div>
    );
  }

  node(): HTMLDivElement {
    return ReactDOM.findDOMNode<HTMLDivElement>(this.refs['select']);
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

export = Select;
