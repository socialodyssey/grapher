import React from 'react'
import * as d3 from 'd3';

class Graph extends React.Component {
  componentDidUpdate(prevProps) {

    if(prevProps.data !== this.props.data) {
      const svg    = d3.select(this.refs['svg']);
      const width  = parseInt(svg.attr('width'));
      const height = parseInt(svg.attr('height'));

      const { nodes, links } = this.props.data;

      const container = svg.append('g')

      const zoom = d3
        .zoom()
        .scaleExtent([1, 8])
        .on('zoom', () => {
          container.attr("transform", d3.event.transform)
        })


      svg.call(zoom)


      const simulation = d3.forceSimulation()
                           .force('link', d3.forceLink().id((d) => d.id))
                           .force('charge', d3.forceManyBody().strength(-600))
                           .force('center', d3.forceCenter(width / 2, height / 2))

      const link = container.append('g')
                      .attr('class', 'links')
                      .selectAll('line')
                      .data(links)
                      .enter()
                      .append('line')
                      .attr('stroke-width', (d) => 1)

      const node = container.append('g')
                      .attr('class', 'nodes')
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
                      .attr('r', (d) => 10)
                      .attr('fill', (d) => '#000')
                     .call(drag)

      node.append('text')
                      .attr('class', 'label')
                      .attr('fill', 'black')
                      .attr('stroke', 'none')
                      .text((d) => d.name)

      simulation
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
      <svg className="Graph" ref="svg" width="900" height="800" />
    )
  }
}

export default Graph;
