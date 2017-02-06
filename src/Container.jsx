import React from 'react';
import Graph from './Graph';
import interactions from './data/interactions';
import entities from './data/entities';
import bridges  from './data/bridges';

import SocialGraph from './SocialGraph';
import SocialStats from './SocialStats';
import RangeSlider from './RangeSlider';
import GraphConfig from './GraphConfig';

function filterBy(key, a, b) {
  return o => {
    const val = o[key];

    return val >= a && val <= b;
  }
}


function getWeight(arr) {
  return arr
    .filter(i => i.type === 'INR.VERBAL-NEAR')
    .reduce((a, b) => a + b, 0);
}

function mapCentralityFor(interactions) {
  return entity => {
    const outs = interactions
      .filter((link) =>
        (
          (link.source === entity.id)))
    
    const ins = interactions
      .filter((link) =>
        (
          (link.target === entity.id)))

    const alpha = 0.5;
    
    const outWeight = getWeight(outs);
    const inWeight = getWeight(ins);
    
    const outCent = outs.length;
    const inCent  = ins.length;


    const outWeighted = outCent * Math.pow((outWeight / (outCent || 1)), alpha);

    const inWeighted  = inCent * Math.pow((inWeight / (inCent || 1)), alpha);

    const totalEdges = inCent + outCent;
    const totalWeight = outWeighted + inWeighted;

    return {
      ...entity,
      centrality: {
        out: outCent,
        in:  inCent,
        outWeighted: Math.round(outWeighted),
        inWeighted:  Math.round(inWeighted),
        weighted:    Math.round(totalWeight)
      }
    }
  }
}

function transformEntity(entity) {
  return {
    id: entity._id,
    ...entity
  }
} 

function transformInteraction({ _from, _to, _id, ...rest }) {
  return {
    id:     _id,
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
        max: 2
      },
      sliderMax: 2,
      graphConfig: {
        'show-bridges': true
      }
    }

    this.fetchData = this.fetchData.bind(this);
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleGraphConfigChange = this.handleGraphConfigChange.bind(this);
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

    const books   = transformedInteractions.map(i => i.book)
    const maxBook = Math.max.apply(null, books);

    const graphData = {
      nodes:   transformedEntities,
      links:   transformedInteractions,
      bridges: bridges
    }

    this.setState({
      graphData,
      filteredData: graphData,
      sliderMax: maxBook,
      sliderValue: {
        min: 1,
        max: maxBook
      }
    })
  }

  handleRangeChange(newValue) {
    const { graphData } = this.state;

    const newLinks = graphData.links
                              .filter(filterBy('book', newValue.min, newValue.max))

                              // TODO: Figure out why this map is necessary.
                              // How is d3 modifying the links even when I clone the array?
                              .map((link) => ({ id: link.id, source: link.source.id, target: link.target.id, selection: link.selection }))
    const newNodes = graphData.nodes.map(mapCentralityFor(newLinks))

    const filteredData = Object.assign(
      {},
      graphData,
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

  handleGraphConfigChange(e) {
    const key = e.target.name;

    const oldConfig = this.state.graphConfig;

    let newConfig = Object.assign({}, oldConfig)
    
    switch(e.target.type) {
      case 'checkbox':
        newConfig[key] = e.target.checked
        break;
      default:
        newConfig[key] = e.target.value
        break;
    }

    console.log(newConfig)

    this.setState({
      graphConfig: newConfig
    })
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const { filteredData, sliderValue, graphConfig } = this.state;

    return (
      <div className="odyssey-grapher">
        <SocialGraph
            data={filteredData}
            showBridges={graphConfig['show-bridges']}
        />

        <div className="control-panel">
          <RangeSlider
              handleChange={this.handleRangeChange}
              min={1}
              max={this.state.sliderMax}
              value={sliderValue} />
          <GraphConfig
              handleChange={this.handleGraphConfigChange}
              current={graphConfig} />

          <SocialStats
              data={filteredData} />
        </div>
      </div>
    )
  }
}

export default Container;
