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
    
    const relevantLinks = links
      .filter((link) => link.book === 4)
      .filter((link) => link.source === nodeID || link.target === nodeID)

    const fromLines = relevantLinks
      .map((link) => link.selection.from_line);

    let lineHash = {}
    relevantLinks
      .forEach((link) => lineHash[link.selection.from_line] = true)

    const maxLine = Math.max.apply(null, fromLines)

    const newData = []

    for(let i = 0, count = 0; i < maxLine; i++) {
      if(lineHash[i]) {
        newData[i] = {
          line:  i,
          count: count++
        };
      }
      else {
        newData[i] = {
          line:  i,
          count: count
        };
      }
    }

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
