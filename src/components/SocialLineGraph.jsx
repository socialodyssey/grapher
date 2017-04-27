import React from 'react';

import { sortAlphabetize, mapSelect } from '../lib/arrayUtils';
import { createCentralityGetter } from '../lib/graphUtils';
import LineGraph                  from './LineGraph';

import '../style/SocialLineGraph.css';

class SocialLineGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      name: ''
    }

    this.getLinksFor = this.getLinksFor.bind(this);
    this.updateData  = this.updateData.bind(this);
  }

  componentDidMount() {
    const { data } = this.props;
    
    if(!data || !data.nodes.length || !data.links.length || !data.linenos.length) {
      return
    }
    
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

    if(!node) {
      console.info('not plotting absent character: ', nodeID)
      return { data: [] };
    }

    const getCentrality = createCentralityGetter(links);
    
    let newData = links
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

    if(!newData.length) {
      return {
        data: [],
        name: node.name
      }
    }

    const xOrigin   = linenos.slice(0, minBook - 1).reduce((a, b) => a + b, 0);
    const xEnd      = linenos.slice(0, maxBook).reduce((a, b) => a + b, 0);
    const lastCount = newData.slice(-1)[0].count;

    return {
      data: [{ line: xOrigin, count: 0 }].concat(newData).concat({ line: xEnd, count: lastCount }),
      name: node.name,
      maxBook,
      minBook
    };
  }

  updateData() {
    const { nodeIDs } = this.props;

    const data        = nodeIDs.map(this.getLinksFor).filter(line => line.data.length);
    const { linenos } = this.props.data;
    const minBook     = Math.min.apply(null, data.map(x => x.minBook));
    const maxBook     = Math.max.apply(null, data.map(x => x.maxBook));

    const lineMarkings = linenos
      .slice(minBook - 1, maxBook + 1)
      .map((lineCount, index, arr) => {
        const offset = linenos.slice(0, minBook + index - 1).reduce((a, b) => a + b, 0);
        
        return {
          point: offset,
          text:  `Book ${minBook + index}`
        }
      })

    this.setState({
      data,
      lineMarkings
    })
  }

  render() {
    const { width, height, onClose } = this.props;
    const { name, data, lineMarkings } = this.state;

    const title = data
      .sort(sortAlphabetize('name'))
      .map(mapSelect('name'))
      .join(', ');

    return (
      <div className="SocialLineGraph">
        <div className="graph-info">
          <h2 className="graph-title">{title}</h2>
          <div className="close-btn" onClick={onClose} style={{ opacity: 0 }}>(Change)</div>
        </div>
        <LineGraph
            width={width}
            height={height}
            data={data}
            lineMarkings={lineMarkings}
            yLabel="Centrality"
            xLabel="Book"
        />
      </div>
    )
  }
}

export default SocialLineGraph;
