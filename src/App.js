import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import SocialGraph from './SocialGraph';

class App extends Component {
  render() {
    return (
      <div className="odyssey-grapher">
          <SocialGraph />
      </div>
    );
  }
}

export default App;
