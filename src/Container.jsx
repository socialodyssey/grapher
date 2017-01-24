import React from 'react';
import Graph from './Graph';
import interactions from './data/interactions';
import entities from './data/entities';

import SocialGraph from './SocialGraph';
import SocialStats from './SocialStats';

class Container extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      graphData: {
        links: [],
        nodes: []
      }
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
      .map((entity) => {

        const centrality = interactions
          .filter((link) =>
            ((link._to === entity._id) || (link._from === entity._id)))
          .length

        return {
          id: entity._id,
          centrality,
          ...entity
        }
      })

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
      <div className="odyssey-grapher">
          <SocialGraph data={this.state.graphData} />
          <SocialStats data={this.state.graphData} />
      </div>
    )
  }
}

export default Container;
