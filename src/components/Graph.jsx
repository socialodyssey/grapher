import React from 'react'
import * as d3 from 'd3';
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

function isWeightedEdge(edge) {
  return edge.type === 'INR.VERBAL-NEAR';
}

class Graph extends React.Component {
  constructor(props) {
    super(props);
    

    this.bridgeHash = {};
    this.linksHash = {};

    this.isBridge = this.isBridge.bind(this);
    this.areConnected = this.areConnected.bind(this);
    this.setLinkStyle = this.setLinkStyle.bind(this);
    this.getNodeHighlighter = this.getNodeHighlighter.bind(this);
    this.getNodeUnhighlighter = this.getNodeUnhighlighter.bind(this);
    this.updateDisplay = this.updateDisplay.bind(this);
    this.updateHashes = this.updateHashes.bind(this);
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
    const { links } = this.props.data;
    const { hlFrom } = opts;
    const { showBridges, showEdgeWeight, showDirection } = this.props;
    
    const weightScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(links, (d) => isWeightedEdge(d) ? d.selection.text.length : 1)
      ])
      .range([1, 40])
    
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
        if(hlFrom && hlFrom.id === d.id && this.areConnected(hlFrom, d)) {
          return 4;
        }

        if(showBridges && this.isBridge(d)) {
          return showEdgeWeight && isWeightedEdge(d) ? weightScale(d.selection.text.length) : 4
        }

        return showEdgeWeight && isWeightedEdge(d) ? weightScale(d.selection.text.length) : 1
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

  updateDisplay() {
    const { data, showDirection }   = this.props;
    const { nodes, links, bridges } = data;

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
      .data(links, l => l.id)

    link
      .exit()
      .remove();

    link = link
      .enter()
      .append('line')
      .merge(link);

    link.on('mouseover', (d) => {
      console.log(d.type)
    })

    this.setLinkStyle(link)

    node
      .on('mouseover', this.getNodeHighlighter(node, label, link))
      .on('mouseout', this.getNodeUnhighlighter(node, label, link))

    this.d3Simulation
      .nodes(nodes)
      .on('tick', () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => {
            if(!this.props.showDirection) {
              return d.target.x;
            }

            const targetCentrality = d.target.centrality.in + d.target.centrality.out;
            const radius = scaleCentrality.range(radiusRange)(targetCentrality);

            const x2 = lineEndPointX(d, radius)

            return x2;
          })
          .attr("y2", d => {
            if(!this.props.showDirection) {
              return d.target.y;
            }
            
            const targetCentrality = d.target.centrality.in + d.target.centrality.out;
            const radius = scaleCentrality.range(radiusRange)(targetCentrality);

            const y2 = lineEndPointY(d, radius)

            return y2
          });

        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
        
        label 
          .attr("dx", d => {
            const centrality = d.centrality.in + d.centrality.out;

            return d.x + scaleCentrality.range(radiusRange)(centrality) + 4;
          })
          .attr("dy", d => {
            return d.y + 6
          });
      });

    this.d3Simulation
        .force('link')
        .links(links);
    
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
        .attr('markerWidth', 10)
        .attr('markerHeight', 5)
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
    this.updateHashes(prevProps);

    this.setLinkStyle(
      this.d3Container
        .select('.links')
        .selectAll('line')
    )

    if(prevProps.data === this.props.data) {
      return;
    }

    this.updateDisplay();
  }

  render() {
    return (
      <svg className="Graph" ref="svg" width={this.props.width} height={this.props.height} />
    )
  }
}

export default Graph;








