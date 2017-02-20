import React from 'react';
import * as d3 from 'd3';

const margin = {top: 20, right: 90, bottom: 30, left: 50};

const lineColors = [
  '#5BC0EB',
  '#C3423F',
  '#000',
  '#FDE74C',
  '#bababa'
];

function flatten(arr) {
  return [].concat.apply(Array.prototype, arr);
}

class LineGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.updateDisplay = this.updateDisplay.bind(this);
  }

  updateDisplay() {
    const { data, lineMarkings } = this.props;
    const graphData = flatten(data).map((d) => d.data)

    const svg    = d3.select(this.refs['svg']);
    const width  = parseInt(svg.attr('width')) - margin.left - margin.right;
    const height = parseInt(svg.attr('height')) - margin.top - margin.bottom;

    const x = d3
      .scaleLinear()
      .rangeRound([0, width])
    
    const y = d3
      .scaleLinear()
      .rangeRound([height, 0])

    const lines = graphData.map((d) => {
      return d3
        .line()
        .x((d) => x(d.line))
        .y((d) => y(d.count))
        .curve(d3.curveBasis)
    })

    const flatData  = flatten(graphData);

    x.domain(this.props.xDomain || d3.extent(flatData, (d) => d.line))
    y.domain(this.props.yDomain || d3.extent(flatData, (d) => d.count));

    const axisBottom = d3.axisBottom(x);
    const axisLeft   = d3.axisLeft(y);

    if (lineMarkings) {
      const ticks = lineMarkings.map(x => x.point);
      axisBottom
        .tickValues(ticks)
        .tickFormat((d, index) => {
          return lineMarkings[index].text
        })
    }

    this.d3BottomAxis
        .call(axisBottom)

    this.d3LeftAxis
        .call(axisLeft);

    this.d3Container
        .selectAll('.line')
        .remove()
    
    this.d3Container
        .selectAll('.label')
        .remove()

    const paths = lines.map((line, index) => {
      const path = this.d3Container
        .append('g');

      const color = lineColors[index % lineColors.length];
      path
        .append('path')
        .attr('class', 'line')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('d', line(graphData[index]));

      const lastDatum = graphData[index].slice(-1)[0];
      
      path
        .append('text')
        .attr('class', 'label')
        .attr('fill', color)
        .attr("transform", "translate(" + x(lastDatum.line) + "," + y(lastDatum.count) + ")")
        .attr('text-anchor', 'start')
        .attr('stroke', 'none')
        .attr('font-weight', 'bold')
        .attr('opacity', '0')
        .text(data[index].name);

      return path;
    })

    paths.forEach((path) => {
      const pathLength = path.select('.line').node().getTotalLength();

      path
        .select('.line')
        .attr('stroke-dasharray', pathLength + ' ' + pathLength)
        .attr('stroke-dashoffset', pathLength)
        .transition()
        .duration(1000)
        .attr('stroke-dashoffset', 0);

      path
        .select('text')
        .transition()
        .duration(1400)
        .attr('opacity', '1')
    })
  }

  componentDidMount() {
    const svg    = d3.select(this.refs['svg'])
    const width  = parseInt(svg.attr('width')) - margin.left - margin.right;
    const height = parseInt(svg.attr('height')) - margin.top - margin.bottom;

    const { xLabel, yLabel } = this.props;

    this.d3Container = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    this.d3BottomAxis = this.d3Container
        .append('g')
        .attr('transform', 'translate(0,' + height + ')');

    this.d3BottomAxis
        .append('text')
        .attr('fill', '#000')
        .attr('dx', width )
        .attr('dy', '-1em')
        .attr('text-anchor', 'end')
        .attr('stroke', 'none')
        .text(xLabel);
    
    this.d3LeftAxis = this.d3Container
        .append('g');

    this.d3LeftAxis
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .attr('stroke', 'none')
        .text(yLabel);

    this.updateDisplay()
  }

  componentDidUpdate(prevProps) {
    if(prevProps.data !== this.props.data) {
      this.updateDisplay()
    }
  }

  render() {
    const { width, height } = this.props;
    
    return (
      <svg className="LineGraph" ref="svg" width={width} height={height} />
    )
  }
}

export default LineGraph;








