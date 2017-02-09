import React from 'react';

import LineGraph from './LineGraph';

class SocialLineGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      name: ''
    }

    this.updateData = this.updateData.bind(this);
  }

  componentDidMount() {
    this.updateData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.updateData();
    }
  }

  updateData() {
    const { data, nodeID, book } = this.props;
    const { links, nodes } = data;

    let count = 0;
    const newData = links
      .filter((link) => link.book === book)
      .filter((link) => (link.source.id || link.source) === nodeID || (link.target.id || link.target) === nodeID)
      .map((link) => link.selection.from_line)
      .sort((a, b) => a - b)
      .map((line) => ({ line, count: count++ }))

    const name = nodes.filter((node) => node.id === nodeID)[0].name

    this.setState({
      data: newData,
      name
    })
  }

  render() {
    const { width, height } = this.props;
    const { name, data } = this.state;
    
    return (
      <div className="SocialLineGraph">
        <div className="graph-info">
          <h2>{name}, Book: {this.props.book}</h2>
        </div>
        <LineGraph
            width={width}
            height={height}
            data={data}
        />
      </div>
    )
  }
}

export default SocialLineGraph;
