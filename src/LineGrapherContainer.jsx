import React from 'react';
import range from 'lodash.range';

import LineGrapher from './LineGrapher';

class LineGrapherContainer extends React.Component {
  constructor(props) {
    super(props);

    const defaultGraphs = props.defaultGraphs || [null];

    this.state = {
      graphs: defaultGraphs
    }

    this.handleAddGraph = this.handleAddGraph.bind(this);
  }

  handleAddGraph() {
    this.setState({
      graphs: this.state.graphs.concat([null])
    })
  }
  
  render() {
    const { data } = this.props;
    
    return (
      <div className="LineGrapherContainer">
        {
          this.state.graphs.map((characters, index) => 
            <LineGrapher key={index} data={data} characters={characters} />
          )
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
