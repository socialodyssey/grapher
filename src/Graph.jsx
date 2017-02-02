import React from 'react'
import * as d3 from 'd3';

class Graph extends React.Component {
  componentDidMount() {
    const svg    = d3.select(this.refs['svg']);
    const width  = parseInt(svg.attr('width'));
    const height = parseInt(svg.attr('height'));

    // Add container group tag
    const container = svg
      .append('g')
      .attr('class', 'container')

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
  }

  componentDidUpdate(prevProps) {
    if(prevProps.data !== this.props.data) {
      const svg    = d3.select(this.refs['svg']);
      const width  = parseInt(svg.attr('width'));
      const height = parseInt(svg.attr('height'));

      const { nodes, links } = this.props.data;

      const container = svg.select('.container');

      const simulation = d3.forceSimulation()
                           .force('link', d3.forceLink().id((d) => d.id))
                           .force('charge', d3.forceManyBody().strength(-3000))
                           .force('center', d3.forceCenter(width / 2, height / 2))
                           .velocityDecay(0.8)

      container.select('.links').selectAll('line').remove()
      container.select('.nodes').selectAll('.node').remove()

      const link = container
                      .select('.links')
                      .selectAll('line')
                      .data(links)
                      .enter()
                      .append('line')
                      .attr('stroke-width', (d) => 1)

      const node = container
                      .select('.nodes')
                      .selectAll('.node')
                      .data(nodes)
                      .enter().append('g')
                      .attr('class', 'node')

      const drag = d3.drag()
                      .on('start', (d) => {
                        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                      })
                      .on('drag', (d) => {
                        d.fx = d3.event.x;
                        d.fy = d3.event.y;
                      })
                      .on('end', (d) => {
                        if (!d3.event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                      })

      node.append('circle')
                     .attr('r', (d) => Math.max(4, (0.4 * d.centrality)))
                     .attr('fill', (d) => '#abc')
                     .call(drag)

      node.append('text')
                      .attr('class', 'label')
                      .attr('fill', 'black')
                      .attr('stroke', 'none')
                      .text((d) => d.name)

      simulation.restart()
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

      simulation
          .force('link')
          .links(links);
    }
  }

  render() {
    return (
      <svg className="Graph" ref="svg" width={this.props.width} height={this.props.height} />
    )
  }
}

export default Graph;
