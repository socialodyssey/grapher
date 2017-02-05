import React from 'react'
import * as d3 from 'd3';

class Graph extends React.Component {
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
    if(prevProps.data !== this.props.data) {
      const colors = {
        circleFill:   '#abc',
        circleHlFill: '#e5efff',
        circleHlStroke: '#f7ff21',
        line:   '#bababa',
        lineHl: '#f7ff21'
      };

      const { nodes, links } = this.props.data;

      let mapOfLinks = {};
      links.forEach((link) => {
        mapOfLinks[link.source + '-' + link.target] = true;
      })

      const container = this.d3Container;

      //
      // Not sure why this is stll necessary?
      // I think there's something with my merge logic?
      //
      container.select('.nodes').selectAll('.node').remove();

      const scaleCentrality = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(nodes, (d) => d.centrality)
        ])

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
        .attr('r', (d) => scaleCentrality.range([1, 70])(d.centrality))
        .attr('fill', (d) => colors.circleFill)
        .attr('stroke-width', (d) => scaleCentrality.range([1, 5])(d.centrality))
        .call(this.d3Drag)

      node
        .append('text')
        .attr('class', 'label')
        .attr('fill', 'black')
        .attr('stroke', 'none')
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
        .merge(link)
        .attr('stroke-width', 1)
        .attr('stroke', colors.line)


      function areConnected (a, b) {
        return mapOfLinks[a.id + '-' + b.id] || mapOfLinks[b.id + '-' + a.id];
      }

      // Can't get setting multiple 'style'/attrs at once so…
      const highlightNode = (d) => {
        node
          .selectAll('circle')
          .style('fill', (d2) => {
            if(d.id === d2.id || areConnected(d, d2)) {
              return colors.circleHlFill;
            }

            return colors.circleFill;
          })
          .style('stroke', (d2) => {
            if(d.id === d2.id || areConnected(d, d2)) {
              return colors.circleHlStroke;
            }

            return 'none';
          })

        link
          .style('stroke', (d2) => {
            if(d2.source.id === d.id || d2.target.id === d.id) {
              return colors.lineHl
            }

            return colors.line;
          })
          .style('stroke-width', (d2) => {
            if(d2.source.id === d.id || d2.target.id === d.id) {
              return 4
            }

            return 1
          })
      }

      const unhighlightNode = (d) => {
        if(this.dragging) return null;
        
        node
          .selectAll('circle')
          .style('fill', colors.circleFill)
          .style('stroke', 'none')
        
        link
          .style('stroke', colors.line)
          .style('stroke-width', 1)
      }

      node
          .selectAll('circle')
          .on('mouseover', (d) => highlightNode(d))
          .on('mouseout', (d) => unhighlightNode(d))

      this.d3Simulation
          .nodes(nodes)
          .on('tick', () => {
            link
              .attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

            node
              .selectAll('circle')
              .attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
            
            node
              .selectAll('.label')
              .attr("dx", function(d) { return d.x + 10; })
              .attr("dy", function(d) { return d.y + 5; });
          });

      this.d3Simulation
        .force('link')
        .links(links);
      
      this.d3Simulation.alpha(1).restart();
    }
  }

  render() {
    return (
      <svg className="Graph" ref="svg" width={this.props.width} height={this.props.height} />
    )
  }
}

export default Graph;








