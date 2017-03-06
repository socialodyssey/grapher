import React         from 'react'
import * as d3       from 'd3';
import { getWeight } from '../lib/graphUtils';

import '../style/Graph.css';

const colors = {
  circleFill:      '#5BC0EB',
  circleHlFill:    '#91d5f2',
  circleHlStroke:  '#FDE74C',
  line:            '#bababa',
  lineHl:          '#FDE74C',
  lineBridge:      '#C3423F',
  text:            '#000'
};

function lineEndPointX (d, radius) {
  const length = Math.sqrt(Math.pow(d.target.y - d.source.y, 2) + Math.pow(d.target.x - d.source.x, 2));
  const scale = (length - radius) / length;
  const offset = (d.target.x - d.source.x) - (d.target.x - d.source.x) * scale;
  
  return d.target.x - offset;
}

function lineEndPointY (d, radius) {
  const length = Math.sqrt(Math.pow(d.target.y - d.source.y, 2) + Math.pow(d.target.x - d.source.x, 2));
  const scale = (length - radius) / length;
  const offset = (d.target.y - d.source.y) - (d.target.y - d.source.y) * scale;
  
  return d.target.y - offset;
}

class Graph extends React.Component {
  constructor(props) {
    super(props);
    

    this.bridgeHash = {};
    this.linksHash = {};

    this.isBridge             = this.isBridge.bind(this);
    this.areConnected         = this.areConnected.bind(this);
    this.setLinkStyle         = this.setLinkStyle.bind(this);
    this.getNodeHighlighter   = this.getNodeHighlighter.bind(this);
    this.getNodeUnhighlighter = this.getNodeUnhighlighter.bind(this);
    this.getNodeClicker       = this.getNodeClicker.bind(this);
    this.getHandleTick        = this.getHandleTick.bind(this);
    this.updateDisplay        = this.updateDisplay.bind(this);
    this.updateHashes         = this.updateHashes.bind(this);
    this.handleExport         = this.handleExport.bind(this);
  }

  isBridge(link) {
    const source = link.source.id || link.source;
    const target = link.target.id || link.target;

    return this.bridgeHash[source + '-' + target] || this.bridgeHash[target + '-' + source]
  }
  
  areConnected(a, b) {
    return this.linksHash[a.id + '-' + b.id] || this.linksHash[b.id + '-' + a.id];
  }
    
  setLinkStyle(link, opts={}) {
    const { hlFrom } = opts;
    const { showBridges, showEdgeWeight, showDirection } = this.props;

    const weightScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(this.mergedLinks, (d) => d.weight)
      ])
      .range([1, 30])
    
    link
      .style('stroke', (d) => {
        if(hlFrom &&
           (d.source.id === hlFrom.id || d.target.id === hlFrom.id)) {
          return colors.lineHl
        }

        if(showBridges && this.isBridge(d)) {
          return colors.lineBridge;
        }

        return colors.line
      })
      .style('stroke-width', (d) => {
        // Not really sure why this is here?
        if(hlFrom && hlFrom.id === d.id && this.areConnected(hlFrom, d)) {
          return 4;
        }

        if(showBridges && this.isBridge(d)) {
          return showEdgeWeight ? weightScale(d.weight) : 1;
        }

        return showEdgeWeight   ? weightScale(d.weight) : 1;
      })
    
    link
      .style('marker-end', (d) => {
        if(showDirection) {
          return 'url(#end-arrow)'
        }

        return '';
      })

  }
  
  getNodeHighlighter(node, label, link) {
    return d => {
      node
        .style('fill', (d2) => {
          if(d.id === d2.id || this.areConnected(d, d2)) {
            return colors.circleHlFill;
          }

          return colors.circleFill;
        })
        .style('stroke', (d2) => {
          if(d.id === d2.id || this.areConnected(d, d2)) {
            return colors.circleHlStroke;
          }

          return 'none';
        })
        .style('opacity', (d2) => {
          if(d.id === d2.id || this.areConnected(d, d2)) {
            return 1;
          }

          return 0.2;
        })

      label
        .style('font-size', (d2) => {
          if(d.id === d2.id || this.areConnected(d, d2)) {
            return '23px';
          }

          return '16px'
        })

      this.setLinkStyle(link, {
        hlFrom: d
      })
    }
  }
  
  getNodeUnhighlighter(node, label, link) {
    return d => {
      if(this.dragging) return null;
      
      node
        .style('fill', colors.circleFill)
        .style('stroke', 'none')

      label
        .style('font-weight', 'bold')
        .style('font-size', '16px')
      
      this.setLinkStyle(link)
    }
  }

  getNodeClicker(node, label, link) {
    const FADE = 0.2;

    return d => {
      node
        .style('opacity', (d2) => {
          if(d.id === d2.id || this.areConnected(d, d2)) {
            return 1;
          }

          return FADE;
        })
      
      label
        .style('opacity', (d2) => {
          if(d.id === d2.id || this.areConnected(d, d2)) {
            return 1;
          }

          return FADE;
        })
      
      this.setLinkStyle(link, {
        hlFrom: d
      })
    }
  }

  getHandleTick(link, node, label, scaleCentrality) {
    return () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => {
          if(!this.props.showDirection) {
            return d.target.x;
          }

          const radius = scaleCentrality(d.target.centrality.weighted);

          const x2 = lineEndPointX(d, radius)

          return x2;
        })
        .attr("y2", d => {
          if(!this.props.showDirection) {
            return d.target.y;
          }
          
          const radius = scaleCentrality(d.target.centrality.weighted);

          const y2 = lineEndPointY(d, radius)

          return y2
        });

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
      
      label 
        .attr("dx", d => {
          return d.x + scaleCentrality(d.centrality.weighted) + 4;
        })
        .attr("dy", d => {
          return d.y + 6
        });
    }
  }

  updateDisplay() {
    const { data, showDirection }   = this.props;
    const { nodes, links, bridges } = data;

    const tmpLinkHash = {};
    
    links.forEach((link) => {
      let key        = link.source + '-' + link.target;
      let reverseKey = link.target + '-' + link.source;

      if (tmpLinkHash[reverseKey]) {
        key = reverseKey;
      }
      else if(!tmpLinkHash[key]) {
        tmpLinkHash[key] = [];
      }

      tmpLinkHash[key].push(link)
    })

    this.mergedLinks = Object.keys(tmpLinkHash).map((key) => {
      const links  = tmpLinkHash[key];

      const out = tmpLinkHash[key]
        .filter((link) =>
          (link.source + '-' + link.target) === key);
      
      const iin = tmpLinkHash[key]
        .filter((link) =>
          (link.source + '-' + link.target) !== key);
      
      const outWeight = out
        .reduce((acc, link) => (acc + getWeight(link)), 0);
      
      const inWeight = iin
        .reduce((acc, link) => (acc + getWeight(link)), 0);

      const weight = outWeight + inWeight;

      // In/out are relative to the first link we found above
      // Now we want to sort out the direction we draw
      const relSource = key.split('-')[0];
      const relTarget = key.split('-')[1];
      const source    = outWeight > inWeight ?
                            relSource : relTarget;
      const target    = outWeight > inWeight ?
                            relTarget : relSource;
      
      
      return {
        id:        key,
        source:    source,
        target:    target,
        inWeight:  Math.round(inWeight),
        outWeight: Math.round(outWeight),
        weight:    Math.round(weight),
        out:       out,
        'in':      iin
      }
    })

    const container = this.d3Container;

    //
    // Not sure why this is stll necessary?
    // I think there's something with my merge logic?
    //
    container.select('.nodes').selectAll('.node').remove();
    container.select('.labels').selectAll('.label').remove();

    const scaleCentrality = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(nodes, (d) => d.centrality.weighted)
      ])

    const radiusRange = [1, 70];
    const strokeRange = [2, 8];

    let node = container
      .select('.nodes')
      .selectAll('.node');

    node = node
      .data(nodes, n => n.id)

    node
      .exit()
      .remove();

    node = node
      .enter()
      .append('circle')
      .merge(node)
      .attr('class', 'node')
      .attr('r', (d) => scaleCentrality.range(radiusRange)(d.centrality.weighted))
      .attr('fill', (d) => colors.circleFill)
      .attr('stroke-width', (d) => scaleCentrality.range(strokeRange)(d.centrality.weighted))
      .call(this.d3Drag)


    let label = container
      .select('.labels')
      .selectAll('.label')

    label = label
      .data(nodes, n => n.id)

    label
      .exit()
      .remove();

    label = label
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('fill', colors.text)
      .attr('stroke', 'none')
      .attr('font-weight', 'bold')
      .text((d) => d.name)

    let link = container
      .select('.links')
      .selectAll('line')

    link = link
      .data(this.mergedLinks, l => l.id)

    link
      .exit()
      .remove();

    link = link
      .enter()
      .append('line')
      .merge(link);

    link.on('click', (d) => {
      console.log(d)
    })

    this.setLinkStyle(link)

    node
      .on('mouseover', this.getNodeHighlighter(node, label, link))
      .on('mouseout', this.getNodeUnhighlighter(node, label, link))
      .on('click', this.getNodeClicker(node, label, link))

    this.d3Simulation
      .nodes(nodes)
      .on('tick', this.getHandleTick(link, node, label, scaleCentrality.range(radiusRange)));

    this.d3Simulation
        .force('link')
        .links(this.mergedLinks);
    
    this.d3Simulation.alpha(1).restart();
  }
  
  componentDidMount() {
    const svg    = d3.select(this.refs['svg']);
    const width  = parseInt(svg.attr('width'));
    const height = parseInt(svg.attr('height'));

    this.updateHashes();

    // Defs add a defs tag for defs
    this.d3Defs = svg
      .append('svg:defs');
    
    // Add arrow marker def
    this.d3Defs
        .append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 10)
        .attr('refY', 5)
        .attr('markerWidth', 6)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr("d", "M 0 0 L 10 5 L 0 10 z")

    // Add container group tag
    this.d3Container = svg
      .append('g')
      .attr('class', 'container')

    const container = this.d3Container;

    // Add link and node groups
    container
      .append('g')
      .attr('class', 'links')

    container
      .append('g')
      .attr('class', 'nodes')
    
    container
      .append('g')
      .attr('class', 'labels')

    // Set up zooming/panning
    const zoom = d3
      .zoom()
      .scaleExtent([0, 8])
      .on('zoom', () => {
        container.attr("transform", d3.event.transform)
      })
    svg.call(zoom)

    this.d3Simulation = d3.forceSimulation()
                          .force('link', d3.forceLink().id((d) => d.id))
                          .force('charge', d3.forceManyBody().strength(-3000))
                          .force('center', d3.forceCenter(width / 2, height / 2))
                          .velocityDecay(0.8)

    this.d3Drag = d3.drag()
                    .on('start', (d) => {
                      if (!d3.event.active) this.d3Simulation.alphaTarget(0.3).restart();
                      d.fx = d.x;
                      d.fy = d.y;
                      this.dragging = true;
                    })
                    .on('drag', (d) => {
                      d.fx = d3.event.x;
                      d.fy = d3.event.y;
                    })
                    .on('end', (d) => {
                      if (!d3.event.active) this.d3Simulation.alphaTarget(0);
                      d.fx = null;
                      d.fy = null;
                      this.dragging = false;
                    })
    
    this.updateDisplay();
  }

  handleExport(e) {
    e.preventDefault();
    e.stopPropagation();

    const svg        = this.refs['svg'];
    const serializer = new XMLSerializer();
    let source       = serializer.serializeToString(svg);
    
    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    var url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);
    window.location = url;
  }

  updateHashes(prevProps) {
    const { links, bridges } = this.props.data;

    if(!bridges) return;

    prevProps = prevProps || {
      data: this.props.data
    }

    if(bridges !== prevProps.data.bridges || Object.keys(this.bridgeHash).length === 0) {
      this.bridgeHash = {};
      bridges.forEach((bridge) => {
        this.bridgeHash[bridge.from + '-' + bridge.to] = true;
      })
    }

    if(links !== prevProps.data.links || Object.keys(this.linksHash).length === 0) {
      this.linksHash = {};
      links.forEach((link) => {
        this.linksHash[link.source + '-' + link.target] = true;
      })
    }
  }

  componentDidUpdate(prevProps) {
    const { pauseSimulation } = this.props;
    
    this.updateHashes(prevProps);

    this.setLinkStyle(
      this.d3Container
        .select('.links')
        .selectAll('line')
    )

    if(pauseSimulation !== prevProps.pauseSimulation) {
      if(pauseSimulation) {
        this.d3Simulation.velocityDecay(1);
      }
      else {
        this.d3Simulation.velocityDecay(0.8);
      }
    }

    if(prevProps.data === this.props.data) {
      this.d3Simulation.restart();
      return;
    }

    this.updateDisplay();
  }

  render() {
    return (
      <div>
        <svg className="Graph" id="foobarzee"ref="svg" width={this.props.width} height={this.props.height} />
        <button className="btn export-btn" onClick={this.handleExport}>Export</button>
      </div>
    )
  }
}

export default Graph;








