import React from 'react';

export default class Body extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <li className="nav-item">
        <button className="button-link" onClick={this.props.onButtonClick}>
          {this.props.template}
        </button>
      </li>
    );
  }
}
