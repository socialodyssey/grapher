import React from 'react';

import { createCentralityGetter } from './lib/graphUtils';
import LineGraph                  from './LineGraph';

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

    let maxBook = 1;
    let minBook = 24;
    
    const node = nodes.filter((node) => node.id === nodeID)[0];

    const getCentrality = createCentralityGetter(links);
    
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
        minBook = Math.min(book, minBook);

        return offset + point
      })
      .sort((a, b) => a - b)
      .map((line) => ({ line, count: getCentrality(node, line).centrality.weighted }))
      /*.map(({ line, count }) => {
        let total_lines = 0;
        let book        = 0;
        
        while(total_lines < line) {
          total_lines += linenos[book];
          book += 1;
        }

        const linesInBk      = linenos[book - 1];
        const linesRemaining = Math.abs(line - total_lines);
        const linesThrough   = linesInBk - linesRemaining;

        return {
          line: book + (linesThrough / linesInBk),
          count
        }
         })*/

    if(!newData.length) {
      return {
        data: [],
        name: node.name
      }
    }

    const xDomain = [
      //minBook,
      //maxBook
      newData[0].line,
      linenos.slice(0, maxBook).reduce((a, b) => a + b, 0)
    ];

    return {
      data: [{ line: minBook, count: 0 }].concat(newData),
      name: node.name,
      xDomain
    };
  }

  updateData() {
    const { nodeIDs } = this.props;

    const data = nodeIDs.map(this.getLinksFor)
    
    this.setState({
      data
    })
  }

  render() {
    const { width, height, onClose } = this.props;
    const { name, data, xDomain } = this.state;

    return (
      <div className="SocialLineGraph">
        <div className="graph-info">
          <h2 className="graph-title">{data.map((d, index) => index === (data.length - 1) ? d.name : d.name + ', ')}</h2>
          <div className="close-btn" onClick={onClose}>(Change)</div>
        </div>
        <LineGraph
            width={width}
            height={height}
            data={data}
            yLabel="Centrality"
            xLabel="Book"
        />
      </div>
    )
  }
}

export default SocialLineGraph;
