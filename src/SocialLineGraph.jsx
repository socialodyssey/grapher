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
    if (prevProps !== this.props) {
      this.updateData();
    }
  }

  updateData() {
    const { data, nodeID, book } = this.props;
    const { links } = data;

    let count = 0;
    const newData = links
      .filter((link) => link.book === book)
      .filter((link) => (link.source.id || link.source) === nodeID || (link.target.id || link.target) === nodeID)
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
        <div className="graph-info">
          <h2>{this.props.name}, Book: {this.props.book}</h2>
        </div>
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
