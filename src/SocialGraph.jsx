import React from 'react';
import Graph from './Graph';
import interactions from './data/interactions';
import entities from './data/entities';

class SocialGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      graphData: {}
    }

    this.fetchData = this.fetchData.bind(this);
  }

  // MILO: This used to be async, hence the overwrought design
  //       leaving it so we can drop async calls back in if the
  //       json gets to be too much.
  //
  //       Also, it would be nice to have direct access to the db
  //       in future.
  //
  fetchData() {
    const transformedEntities = entities
      .map(({ _id, ...rest }) => ({
        id: _id,
        ...rest
      }))

    const transformedInteractions = interactions
      .map(({ _from, _to, ...rest }) => ({
        source: _from,
        target: _to,
        ...rest
      }))

    this.setState({
      graphData: {
        nodes: transformedEntities,
        links: transformedInteractions
      } 
    })
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    return (
      <div className="SocialGraph">
        <Graph data={this.state.graphData} />
      </div>
    )
  }
}

export default SocialGraph;
