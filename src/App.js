import React, { Component } from 'react';
import 'normalize.css/normalize.css';
import './style/App.css';

import Container from './components/Container';

class App extends Component {
  render() {
    return (
      <div className="odyssey-grapher">
          <Container history={this.props.history} />
      </div>
    );
  }
}

export default App;
