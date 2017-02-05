import React from 'react'
import * as d3 from 'd3';

const colors = {
  circleFill:   '#5BC0EB',
  circleHlFill: '#91d5f2',
  circleHlStroke: '#FDE74C',
  line:   '#bababa',
  lineHl: '#FDE74C',
  lineBridge: '#C3423F'
};


class Graph extends React.Component {
  constructor(props) {
    super(props);
    
    this.isBridge = this.isBridge.bind(this);
    this.areConnected = this.areConnected.bind(this);
    this.setLinkStyle = this.setLinkStyle.bind(this);
    this.getNodeHighlighter = this.getNodeHighlighter.bind(this);
    this.getNodeUnhighlighter = this.getNodeUnhighlighter.bind(this);
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
    const { showBridges } = this.props;

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
          return 4;
        }

        return 1;
      })
  }
  
  getNodeHighlighter(node, link) {
    return d => {
      node
        .selectAll('circle')
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

      this.setLinkStyle(link, {
        hlFrom: d
      })
    }
  }
  
  getNodeUnhighlighter(node, link) {
    return d => {
      if(this.dragging) return null;
      
      node
        .selectAll('circle')
        .style('fill', colors.circleFill)
        .style('stroke', 'none')

      this.setLinkStyle(link)
    }
  }
  
  componentDidMount() {
    const svg    = d3.select(this.refs['svg']);
    const width  = parseInt(svg.attr('width'));
    const height = parseInt(svg.attr('height'));

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
  }

  componentDidUpdate(prevProps) {
    const { nodes, links, bridges } = this.props.data;

    if(bridges !== prevProps.data.bridges) {
      this.bridgeHash = {};
      bridges.forEach((bridge) => {
        this.bridgeHash[bridge.from + '-' + bridge.to] = true;
      })
    }

    if(links !== prevProps.data.links) {
      this.linksHash = {};
      links.forEach((link) => {
        this.linksHash[link.source + '-' + link.target] = true;
      })
    }

    const container = this.d3Container;

    this.setLinkStyle(
      container
        .select('.links')
        .selectAll('line')
    )

    if(prevProps.data === this.props.data) {
      return;
    }

    //
    // Not sure why this is stll necessary?
    // I think there's something with my merge logic?
    //
    container.select('.nodes').selectAll('.node').remove();

    const scaleCentrality = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(nodes, (d) => d.centrality.out + d.centrality.in)
      ])

    const radiusRange = [1, 70];
    const strokeRange = [1, 5];

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
      .append('g')
      .merge(node)
      .attr('class', 'node')
    
    node
      .append('circle')
      .attr('r', (d) => scaleCentrality.range(radiusRange)(d.centrality.in + d.centrality.out))
      .attr('fill', (d) => colors.circleFill)
      .attr('stroke-width', (d) => scaleCentrality.range(strokeRange)(d.centrality.in + d.centrality.out))
      .call(this.d3Drag)

    node
      .append('text')
      .attr('class', 'label')
      .attr('fill', 'black')
      .attr('stroke', 'none')
      .attr('font-weight', 'bold')
      .text((d) => d.name)

    let link = container
      .select('.links')
      .selectAll('line')

    link = link
      .data(links, l => l.id);

    link
      .exit()
      .remove();

    link = link
      .enter()
      .append('line')
      .merge(link);

    this.setLinkStyle(link)

    node
      .selectAll('circle')
      .on('mouseover', this.getNodeHighlighter(node, link))
      .on('mouseout', this.getNodeUnhighlighter(node, link))

    this.d3Simulation
      .nodes(nodes)
      .on('tick', () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node
          .selectAll('circle')
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
        
        node
          .selectAll('.label')
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

  render() {
    return (
      <svg className="Graph" ref="svg" width={this.props.width} height={this.props.height} />
    )
  }
}

export default Graph;








