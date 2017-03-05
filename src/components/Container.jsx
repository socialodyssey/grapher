import React        from 'react';
import qs           from 'qs';
import debounce     from 'lodash.debounce';
import Graph        from './Graph';
import interactions from '../data/interactions';
import entities     from '../data/entities';
import bridges      from '../data/bridges';
import linenos      from '../data/linenos';

import { mapCentralityFor } from '../lib/graphUtils';
import Switcher             from './Switcher';
import Tabs                 from './Tabs';
import SocialGraph          from './SocialGraph';
import LineGrapherContainer from './LineGrapherContainer';
import SocialStats          from './SocialStats';
import RangeSlider          from './RangeSlider';
import GraphConfig          from './GraphConfig';

function filterByRange(key, a, b) {
  return o => {
    const val = o[key];

    return val >= a && val < b;
  }
}

function filterNodesBy(links) {
  return node => links.some((link) => {
    return link.target === node._id || link.source === node._id;
  })
}

function keyChanged(key, o1, o2) {
  return o1[key] !== o2[key];
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

function router(location) {
  const { pathname, search, hash } = location;

  const query = qs.parse(search.split('?')[1]);

  const splitPath = pathname.split('/');
  const routeState = {};

  routeState.activeTab = splitPath[1];

  if(!routeState.activeTab) {
    routeState.activeTab = 'graph';
  }

  if(query.fromBook || query.toBook) {
    routeState.sliderValue = {
      min: +query.fromBook || 1,
      max: +query.toBook   || 10
    }
    
    routeState.needsFiltering = true;
  }

  if(query.graph) {
    routeState.defaultLineGraphs = Object
      .keys(query.graph)
      .map((key) => {
        return query.graph[key].map(id => 'Entities/' + id)
      });
  }

  return routeState;
}

class Container extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = Object.assign({}, {
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
        max: 10
      },
      sliderMax: 10,
      graphConfig: {
        'show-bridges':     true,
        'show-edge-weight': true,
        'show-direction':   false,
        'show-cog':         true,
        'show-inr':         true,
        'pause-simulation': false
      },
      activeTab: 'SocialGraph'
    }, router(props.history.location))

    this.fetchData               = this.fetchData.bind(this);
    this.flagToFilter            = debounce(this.flagToFilter.bind(this), 400);
    this.handleRangeChange       = this.handleRangeChange.bind(this);
    this.handleGraphConfigChange = this.handleGraphConfigChange.bind(this);
    this.handleChangeTab         = this.handleChangeTab.bind(this);
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
      bridges: bridges,
      linenos: linenos
    }

    this.setState({
      graphData,
      filteredData: graphData,
      sliderMax: maxBook + 1,
      sliderValue: {
        min: 1,
        max: maxBook + 1
      },
      ...router(this.props.history.location)
    })
  }

  // This is debounced above
  flagToFilter() {
    this.setState({
      needsFiltering: true
    });
  }

  handleRangeChange(newValue) {
    this.setState({
      sliderValue: newValue
    })

    this.flagToFilter();
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
      graphConfig: newConfig
    })

    if(needsFiltering) {
      this.flagToFilter();
    }
  }

  handleChangeTab(tabKey) {
    const { history } = this.props;

    history.push({
      pathname: '/' + tabKey
    })
  }

  componentDidMount() {
    const { history } = this.props;

    this.fetchData();

    this.urlListener = history.listen((location, action) => {
      this.setState(router(location))
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.state.needsFiltering) {

      const { graphData, sliderValue, graphConfig } = this.state;

      const newLinks = graphData.links
                                .filter(filterByRange('book', sliderValue.min, sliderValue.max))
                                .filter((interaction) => {
                                  const { type } = interaction;
                                  
                                  if(graphConfig['show-cog'] &&
                                     (type.lastIndexOf('COG') !== -1)) {
                                    
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

      const newNodes = graphData.nodes
                                .filter(filterNodesBy(newLinks))
                                .map(mapCentralityFor(newLinks))

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

  render() {
    const {
      filteredData,
      sliderValue,
      graphConfig,
      activeTab,
      defaultLineGraphs
    } = this.state;

    return (
      <div className="odyssey-grapher">
        <Tabs
            tabs={[
              {
                key:     'graph',
                text:    'force'
              },
              {
                key:     'line',
                text:    'line'
              }
            ]}
            activeTab={activeTab}
            changeHandler={this.handleChangeTab}
        />

        <Switcher show={activeTab}>
          <SocialGraph
              data={filteredData}
              showBridges={graphConfig['show-bridges']}
              showEdgeWeight={graphConfig['show-edge-weight']}
              showDirection={graphConfig['show-direction']}
              pauseSimulation={graphConfig['pause-simulation']}
              data-tabkey="graph"
          />
          <LineGrapherContainer
              data-tabkey="line"
              data={filteredData}
              defaultGraphs={defaultLineGraphs}
          />
        </Switcher>

        <div className="control-panel">
          <RangeSlider
              title="Books"
              handleChange={this.handleRangeChange}
              min={1}
              max={this.state.sliderMax}
              value={sliderValue} />

          {(activeTab === 'graph') &&
            <GraphConfig
                handleChange={this.handleGraphConfigChange}
                current={graphConfig} />
          }

          {(activeTab === 'graph') &&
            <SocialStats
                data={filteredData} />
          }
        </div>
      </div>
    )
  }
}

export default Container;