import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';

class Home extends Component {
  render() {
    return (
      <div className="home">
        <Header />
        <p>To get started:</p>
        <Link className="btn" to="/Create">Create Network</Link>
        <p>or</p>
        <Link className="btn" to="/Join">Join Network</Link>
      </div>
    );
  }
}

export default Home;