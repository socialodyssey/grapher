import React from 'react';
import * as d3 from 'd3';

class LineGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.updateDisplay = this.updateDisplay.bind(this);
  }

  updateDisplay() {
    const { data } = this.props;

    const margin = {top: 20, right: 20, bottom: 30, left: 50};
    const svg    = d3.select(this.refs['svg']);
    const width  = parseInt(svg.attr('width')) - margin.left - margin.right;
    const height = parseInt(svg.attr('height')) - margin.top - margin.bottom;

    const x = d3
      .scaleLinear()
      .rangeRound([0, width])
    
    const y = d3
      .scaleLinear()
      .rangeRound([height, 0])

    const line = d3
      .line()
      .x((d) => x(d.line))
      .y((d) => y(d.count))
      .curve(d3.curveBasis)

    x.domain(d3.extent(data, (d) => d.line));
    y.domain(d3.extent(data, (d) => d.count));

    this.d3BottomAxis
        .call(d3.axisBottom(x))
        .append('text')
        .attr('fill', '#000')
        .attr('dx', width )
        .attr('dy', '-1em')
        .attr('text-anchor', 'end')
        .attr('stroke', 'none')
        .text('Line');

    this.d3LeftAxis
        .call(d3.axisLeft(y))
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .attr('stroke', 'none')
        .text('Interactions');

    this.d3Container
        .select('.line')
        .remove()
    
    const path = this.d3Container
        .append('path')
        .attr('class', 'line')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('d', line(data));

    const pathLength = path.node().getTotalLength();

    path
      .attr('stroke-dasharray', pathLength + ' ' + pathLength)
      .attr('stroke-dashoffset', pathLength)
      .transition()
      .duration(1000)
      .attr('stroke-dashoffset', 0)
  }

  componentDidMount() {
    const margin = {top: 20, right: 20, bottom: 30, left: 50};
          
    const svg    = d3.select(this.refs['svg'])
    const width  = parseInt(svg.attr('width')) - margin.left - margin.right;
    const height = parseInt(svg.attr('height')) - margin.top - margin.bottom;

    this.d3Container = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    this.d3BottomAxis = this.d3Container
        .append('g')
        .attr('transform', 'translate(0,' + height + ')')
    
    this.d3LeftAxis = this.d3Container
        .append('g')

    this.updateDisplay()
  }

  componentDidUpdate() {
    this.updateDisplay()
  }

  render() {
    const { width, height } = this.props;
    
    return (
      <svg className="LineGraph" ref="svg" width={width} height={height} />
    )
  }
}

export default LineGraph;








