import React from 'react';

import LineGraph from './LineGraph';

class SocialLineGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    }

    this.updateData = this.updateData.bind(this);
  }

  componentDidMount() {
    this.updateData();
  }

  componentDidUpdate(prevProps) {
    if(prevProps.data !== this.props.data) {
      this.updateData();
    }
  }

  updateData() {
    const { data, nodeID } = this.props;
    const { links } = data;
    
    let count = 0;
    const newData = links
      .filter((link) => link.book === 4)
      .filter((link) => link.source === nodeID || link.target === nodeID)
      .map((link) => link.selection.from_line)
      .sort((a, b) => a - b)
      .map((line) => ({ line, count: count++ }))

    this.setState({
      data: newData
    })
  }

  render() {
    return (
      <div className="SocialLineGraph">
        <LineGraph
            width={750}
            height={500}
            data={this.state.data}
        />
      </div>
    )
  }
}

export default SocialLineGraph;
