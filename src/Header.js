import React, { Component } from 'react';

class Header extends Component {
  render() {
    return (
      <header className="Header">
        <h1 className="logo"><em>P5</em> Chat</h1>
        <h2>{this.props.subtitle}</h2>
      </header>
    );
  }
}

export default Header;