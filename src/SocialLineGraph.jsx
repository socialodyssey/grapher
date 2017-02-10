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
    const { data, nodeID, book }    = this.props;
    const { links, nodes, linenos } = data;

    let maxBook = 1;

    let count = 0;
    const newData = links
      .filter((link) => (link.source.id || link.source) === nodeID || (link.target.id || link.target) === nodeID)
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
      .map((line) => ({ line, count: count++ }))

    const name = nodes.filter((node) => node.id === nodeID)[0].name

    this.setState({
      data: newData,
      name,
      maxBook
    })
  }

  render() {
    const { width, height } = this.props;
    const { name, data, maxBook } = this.state;
    const xDomain = [
      0,
      this.props.data.linenos.slice(0, maxBook).reduce((a, b) => a + b, 0)
    ]

    return (
      <div className="SocialLineGraph">
        <div className="graph-info">
          <h2>{name}</h2>
        </div>
        <LineGraph
            width={width}
            height={height}
            data={data}
            xDomain={xDomain}
        />
      </div>
    )
  }
}

export default SocialLineGraph;
