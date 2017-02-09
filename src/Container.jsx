import React        from 'react';
import Graph        from './Graph';
import interactions from './data/interactions';
import entities     from './data/entities';
import bridges      from './data/bridges';

import Switcher        from './Switcher';
import Tabs            from './Tabs';
import SocialGraph     from './SocialGraph';
import SocialLineGraph from './SocialLineGraph';
import SocialStats     from './SocialStats';
import RangeSlider     from './RangeSlider';
import GraphConfig     from './GraphConfig';

function filterByRange(key, a, b) {
  return o => {
    const val = o[key];

    return val >= a && val <= b;
  }
}


function getWeight(arr) {
  return arr
    .filter(i => i.type === 'INR.VERBAL-NEAR')
    .map(i => i.selection.text.length)
    .reduce((a, b) => a + b, 0);
}

function keyChanged(key, o1, o2) {
  return o1[key] !== o2[key];
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
        'show-bridges':     true,
        'show-edge-weight': true,
        'show-cog':         true,
        'show-inr':         true
      },
      activeTab: 'SocialGraph'
    }

    this.fetchData = this.fetchData.bind(this);
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleGraphConfigChange = this.handleGraphConfigChange.bind(this);
    this.handleChangeTab = this.handleChangeTab.bind(this);
    this.randomEntity = this.randomEntity.bind(this);
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
    this.setState({
      sliderValue: newValue,
      needsFiltering: true
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

    // Basically some config params require us to filter the data up here
    // some get passed on and dealt with in the Graph.jsx componentDidUpdate
    //
    // I recognise this is unideal, but d3.filter seems to break things for me
    // so I'm filtering the data up here.
    //
    const needsFiltering = (keyChanged('show-cog', oldConfig, newConfig) ||
                            keyChanged('show-inr', oldConfig, newConfig));
    
    this.setState({
      graphConfig: newConfig,
      needsFiltering
    })
  }

  handleChangeTab(tabKey) {
    this.setState({
      activeTab: tabKey
    })
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.state.needsFiltering) {

      const { graphData, sliderValue, graphConfig } = this.state;

      const newLinks = graphData.links
                                .filter(filterByRange('book', sliderValue.min, sliderValue.max))
                                .filter(({ type }) => {
                                  if(graphConfig['show-cog'] &&
                                     (type.lastIndexOf('COG') !== -1 || type === 'PCR')) {
                                    
                                    return true;
                                  }

                                  if(graphConfig['show-inr'] &&
                                     (type.lastIndexOf('INR') !== -1)) {

                                    return true
                                  }

                                  return false
                                })


      // TODO: Figure out why this map is necessary.
      // How is d3 modifying the links even when I clone the array?
                                .map(({ source, target, ...rest }) => ({ ...rest, source: source.id || source, target: target.id || target }))

      const newNodes = graphData.nodes.map(mapCentralityFor(newLinks))

      const filteredData = Object.assign(
        {},
        graphData,
        {
          nodes: newNodes,
          links: newLinks
        }
      )

      this.setState({ filteredData, needsFiltering: false });
    }
  }

  randomEntity() {
    const { filteredData } = this.state
    
    if(!filteredData) {
      return ''
    }
    
    const len = filteredData.nodes.length;

    if(!len) {
      return ''
    }

    return filteredData.nodes[Math.floor(Math.random()*len)]
  }

  render() {
    const { filteredData, sliderValue, graphConfig, activeTab } = this.state;

    const randomEntity = this.randomEntity()

    return (
      <div className="odyssey-grapher">
        <Tabs
            tabs={[
              {
                key:     'SocialGraph',
                text:    'force'
              },
              {
                key:     'LineGraph',
                text:    'line'
              }
            ]}
            activeTab={activeTab}
            changeHandler={this.handleChangeTab}
        />

        <Switcher show={this.state.activeTab}>
          <SocialGraph
              data={filteredData}
              showBridges={graphConfig['show-bridges']}
              showEdgeWeight={graphConfig['show-edge-weight']}
              data-tabkey="SocialGraph"
          />
          <SocialLineGraph
              data-tabkey="LineGraph"
              data={filteredData}
              nodeID={randomEntity.id}
              name={randomEntity.name}
              book={Math.ceil(Math.random()*4)}
          />
        </Switcher>

        <div className="control-panel">
          <RangeSlider
              title="Books"
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