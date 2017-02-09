import React from 'react';
import range from 'lodash.range';

import LineGrapher from './LineGrapher';

class LineGrapherContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      graphs: 1
    }

    this.handleAddGraph = this.handleAddGraph.bind(this);
  }

  handleAddGraph() {
    this.setState({
      graphs: this.state.graphs + 1
    })
  }
  
  render() {
    const { data } = this.props;
    
    return (
      <div className="LineGrapherContainer">
        {
          range(this.state.graphs).map((graph, index) =>
            <LineGrapher key={index} data={data} />)
        }
        <div className="add-graph">
          <button className="btn" onClick={this.handleAddGraph} >
            Add Graph
          </button>
        </div>
      </div>
    )
  }
}

export default LineGrapherContainer;
