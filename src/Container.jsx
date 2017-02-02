import React from 'react';
import Graph from './Graph';
import interactions from './data/interactions';
import entities from './data/entities';

import SocialGraph from './SocialGraph';
import SocialStats from './SocialStats';
import RangeSlider from './RangeSlider';

function filterBy(key, a, b) {
  return o => {
    const val = o[key];

    return val >= a && val <= b;
  }
}

function mapCentralityFor(interactions) {
  return entity => {
    const centrality = interactions
      .filter((link) =>
        (
          (link.target === entity.id) ||
          (link.source === entity.id)))
      .length

    return {
      ...entity,
      centrality
    }
  }
}

function transformEntity(entity) {
  return {
    id: entity._id,
    ...entity
  }
} 

function transformInteraction({ _from, _to, ...rest }) {
  return {
    source: _from,
    target: _to,
    ...rest
  }
}

class Container extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      graphData: {
        links: [],
        nodes: []
      },
      filteredData: {
        links: [],
        nodes: []
      },
      sliderValue: {
        min: 1,
        max: 24
      }
    }

    this.fetchData = this.fetchData.bind(this);
    this.handleRangeChange = this.handleRangeChange.bind(this);
  }

  // MILO: This used to be async, hence the overwrought design
  //       leaving it so we can drop async calls back in if the
  //       json gets to be too much.
  //
  //       Also, it would be nice to have direct access to the db
  //       in future.
  //
  fetchData() {
    const transformedInteractions = interactions.map(transformInteraction)
    const transformedEntities     = entities.map(transformEntity).map(mapCentralityFor(transformedInteractions))

    const graphData = {
      nodes: transformedEntities,
      links: transformedInteractions
    }

    this.setState({
      graphData,
      filteredData: graphData
    })
  }

  handleRangeChange(newValue) {
    const { graphData } = this.state;

    const newLinks = graphData.links
                              .filter(filterBy('book', newValue.min, newValue.max))

                              // TODO: Figure out why this map is necessary.
                              // How is d3 modifying the links even when I clone the array?
                              .map((link) => ({ id: link.id, source: link.source.id, target: link.target.id }))
    const newNodes = graphData.nodes.map(mapCentralityFor(newLinks))

    const filteredData = Object.assign(
      {},
      {
        nodes: newNodes,
        links: newLinks
      }
    )

    this.setState({
      sliderValue: newValue,
      filteredData
    })
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const { filteredData, sliderValue } = this.state;
    
    return (
      <div className="odyssey-grapher">
        <SocialGraph
            data={filteredData} />

        <RangeSlider
            handleChange={this.handleRangeChange}
            min={1}
            max={24}
            value={sliderValue} />

        <SocialStats
            data={filteredData} />
      </div>
    )
  }
}

export default Container;
