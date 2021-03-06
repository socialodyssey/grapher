import React        from 'react';
import qs           from 'qs';
import debounce     from 'lodash.debounce';
import range        from 'lodash.range';
import flatten      from 'lodash.flatten';
import axios        from 'axios';
import entities     from '../data/entities';
import bridges      from '../data/bridges';
import linenos      from '../data/linenos';
import percentdone  from '../data/percentdone';

import { mapCentralityFor } from '../lib/graphUtils';
import Switcher             from './Switcher';
import Tabs                 from './Tabs';
import SocialGraph          from './SocialGraph';
import LineGrapherContainer from './LineGrapherContainer';
import SocialStats          from './SocialStats';
import RangeSlider          from './RangeSlider';
import GraphConfig          from './GraphConfig';
import ToolSelector         from './ToolSelector';

function filterNodesBy(links) {
  return node => links.some((link) => {
    return link.target === node._id || link.source === node._id;
  })
}

function filterLinksBy(nodes) {
  return link => {
    const targetIncluded = nodes.some((node) => {
      return (link.target.id || link.target) === node._id
    })
    
    const sourceIncluded = nodes.some((node) => {
      return (link.source.id || link.source) === node._id
    })

    return sourceIncluded && targetIncluded;
  }
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

function transformInteractions(interactions) {
  return interactions.map(transformInteraction);
}

const getBook = (function () {
  const bookCache = {};

  return book => {
    if(bookCache[book]) {
      return bookCache[book]
    };

    return axios
      .get(`interactions/book-${book}.json`)
      .then(res => {
        bookCache[book] = res.data;

        return res.data;
      })
      .catch(e  => console.error(e));
  } 
})()

function router(location) {
  const { pathname, search } = location;

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
        return query.graph[key]
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
        max: percentdone.stats.current_book + 1
      },
      sliderMax: percentdone.stats.current_book + 1,
      graphConfig: {
        'show-bridges':     true,
        'show-edge-weight': true,
        'show-direction':   false,
        'show-cog':         true,
        'show-inr':         true,
        'show-gods':        true,
        'show-people':      true,
        'pause-simulation': false,
        'lowest-weight':    0,
        'tool':             'highlight'
      },
      activeTab: 'SocialGraph',
      nodeBlacklist: []
    }, router(props.history.location))

    this.fetchData               = this.fetchData.bind(this);
    this.filterData              = this.filterData.bind(this);
    this.flagToFilter            = debounce(this.flagToFilter.bind(this), 800);
    this.updateUrl               = debounce(this.updateUrl.bind(this), 400);
    this.handleRangeChange       = this.handleRangeChange.bind(this);
    this.handleGraphConfigChange = this.handleGraphConfigChange.bind(this);
    this.handleChangeTab         = this.handleChangeTab.bind(this);
    this.handleChangeTool        = this.handleChangeTool.bind(this);
    this.handleRemoveNode        = this.handleRemoveNode.bind(this);
  }

  // MILO: This used to be async, hence the overwrought design
  //       leaving it so we can drop async calls back in if the
  //       json gets to be too much.
  //
  //       Also, it would be nice to have direct access to the db
  //       in future.
  //
  fetchData() {
    const maxBook             = this.state.sliderValue.max - 1;
    
    return Promise.all(
      range(maxBook).map(i => i + 1).map(getBook)
    )
    .then(flatten)
    .then(transformInteractions)
    .then((transformedInteractions) => {
      const transformedEntities = entities.map(transformEntity).map(mapCentralityFor(transformedInteractions));
      
      const graphData = {
        nodes:   transformedEntities,
        links:   transformedInteractions,
        bridges: bridges,
        linenos: linenos
      }

      this.setState({
        graphData,
        filteredData: graphData,
      })
    })
    
  }

  // This is debounced above
  flagToFilter() {
    this.setState({
      needsFiltering: true
    });
  }

  // This is also debounced above
  updateUrl(sliderValue) {
    const queryString = qs.stringify({
      fromBook: sliderValue.min,
      toBook:   sliderValue.max
    });

    this.props.history.push({
      search: queryString
    })

  }

  handleRangeChange(newValue) {
    this.setState({
      sliderValue: newValue
    })

    this.flagToFilter();
    this.updateUrl(newValue);
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
                            keyChanged('show-gods', oldConfig, newConfig) ||
                            keyChanged('show-people', oldConfig, newConfig) ||
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

  handleChangeTool(name) {
    const newConfig = Object.assign({}, this.state.graphConfig, {
      tool: name
    });

    this.setState({
      graphConfig: newConfig
    });
  }

  filterData() {
    const { graphData, sliderValue, graphConfig, nodeBlacklist } = this.state;

    const newLinks = graphData.links
                              .filter((interaction) => {
                                return interaction.book >= sliderValue.min && interaction.book < sliderValue.max;
                              })
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
                              .map(({ source, target, ...rest }) => ({ ...rest, source: source.id || source, target: target.id || target }));

    const newNodes = graphData.nodes
                              .filter(({ id, type }) => {
                                if(!graphConfig['show-people'] && type.lastIndexOf('PER') !== -1) {
                                  return false;
                                }

                                if(!graphConfig['show-gods'] && type.lastIndexOf('GOD') !== -1) {
                                  return false;
                                }
                                
                                return !nodeBlacklist.includes(id)
                              })
                              .filter(filterNodesBy(newLinks))
                              .filter((node) => node.centrality.weighted > graphConfig['lowest-weight'])

    const finalLinks = newLinks.filter(filterLinksBy(newNodes));
    const finalNodes = newNodes
      .filter(filterNodesBy(finalLinks))
      .map(mapCentralityFor(finalLinks))

    const filteredData = Object.assign(
      {},
      graphData,
      {
        nodes: finalNodes,
        links: finalLinks
      }
    )
    this.setState({ filteredData, needsFiltering: false });
  }

  handleRemoveNode(id) {
    const { nodeBlacklist } = this.state;
    
    this.setState({
      nodeBlacklist: nodeBlacklist.concat([id])
    }, () => {
      this.flagToFilter();
    });
    
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
      this.fetchData().then(this.filterData);
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

        {(activeTab === 'graph') &&
          <ToolSelector
              handleChangeTool={this.handleChangeTool}
              currentVal={graphConfig['tool']}
          />
        }

        <Switcher show={activeTab}>
          <SocialGraph
              data={filteredData}
              showBridges={graphConfig['show-bridges']}
              showEdgeWeight={graphConfig['show-edge-weight']}
              showDirection={graphConfig['show-direction']}
              pauseSimulation={graphConfig['pause-simulation']}
              tool={graphConfig['tool']}
              removeNode={this.handleRemoveNode}
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

            <GraphConfig
              handleChange={this.handleGraphConfigChange}
              current={graphConfig} />

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
