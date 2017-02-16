import React from 'react';

import { mapCentralityFor } from './lib/graphUtils';
import LineGraph            from './LineGraph';

class SocialLineGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      name: ''
    }

    this.getLinksFor = this.getLinksFor.bind(this);
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

  getLinksFor(nodeID) {
    const { data }                  = this.props;
    const { links, nodes, linenos } = data;

    let count   = 0;
    let maxBook = 1;
    
    const node = nodes.filter((node) => node.id === nodeID)[0];
    
    const newData = links
      .filter((link) => {
        const source = link.source.id || link.source;
        const target = link.target.id || link.target;

        return (nodeID === source || nodeID === target);
      })
      .map((link) => {
        const book   = link.book;
        const point  = link.selection.from_line;
        const offset = linenos
          .slice(0, book - 1)
          .reduce((a, b) => a + b, 0)

        maxBook = Math.max(book, maxBook);

        return offset + point
      })
      .sort((a, b) => a - b)
      .map((line) => ({ line, count: mapCentralityFor(links, line)(node).centrality.weighted }))


    const xDomain = [
      0,
      this.props.data.linenos.slice(0, maxBook).reduce((a, b) => a + b, 0)
    ]

    return {
      data: newData,
      name: node.name,
      xDomain
    }
  }

  updateData() {
    const { nodeIDs } = this.props;

    const data = nodeIDs.map(this.getLinksFor)
    
    this.setState({
      data
    })
  }

  render() {
    const { width, height } = this.props;
    const { name, data } = this.state;

    return (
      <div className="SocialLineGraph">
        <div className="graph-info">
          <h2>{data.map((d, index) => index === (data.length - 1) ? d.name : d.name + ', ')}</h2>
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
