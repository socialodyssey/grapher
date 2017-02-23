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

    this.d3LinesContainer
        .selectAll('.line')
        .remove()
    
    this.d3LabelsContainer
        .selectAll('.label')
        .remove()

    const paths = lines
      .map((line, index) => {
        const pathData = graphData[index];
        
        const path = this.d3LinesContainer
                         .append('g');

        const color = lineColors[index % lineColors.length];
        path
          .append('path')
          .attr('class', 'line')
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .attr('fill', 'none')
          .attr('d', line(pathData));

        const lastDatum = pathData.slice(-1)[0];

        this.d3LabelsContainer
          .append('text')
          .attr('class', 'label')
          .attr('fill', color)
          .attr("transform", "translate(" + x(lastDatum.line) + "," + y(lastDatum.count) + ")")
          .attr('text-anchor', 'start')
          .attr('stroke', 'none')
          .attr('font-weight', 'bold')
          .attr('opacity', '0')
          .text(data[index].name)
          .transition()
          .duration(2000)
          .attr('opacity', '1')
        

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
    })

    function getLineAt(mouseX) {
      const point = Math.round(x.invert(mouseX));
      
      if(!lineMarkings) {
        return point;
      }

      for(let i=0; i < lineMarkings.length; i++) {
        const mark = lineMarkings[i];

        if(mark.point > point) {
          const offset = lineMarkings
            .slice(0, i)
            .map(m => m.point)
            .slice(-1)[0];

          return point - offset;
        }
      }

      // Otherwise we want the last marking
      const offset = lineMarkings
        .map(m => m.point)
        .slice(-1)[0];

      return point - offset;
    }

    this.d3Overlay
        .on('mousemove', () => {
          const mouse = d3.mouse(this.d3Overlay.node());

          this.d3HelperLine
              .select('line')
              .attr('transform', `translate(${mouse[0]} 0)`);

          this.d3HelperLine
                 .select('text')
                 .attr('transform', `translate(${mouse[0] + 8} ${mouse[1]})`)
                 .text(`LINE ${Math.round(getLineAt(mouse[0]))}`)
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

    this.d3LinesContainer  = this.d3Container.append('g');
    this.d3LabelsContainer = this.d3Container.append('g'); 
    
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

    this.d3HelperLine = this.d3Container
        .append('g')
        .attr('opacity', 0);

    this.d3HelperLine
        .append('line')
        .attr('stroke', 'green')
        .attr('stroke-dasharray', '3, 3')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', height);

    this.d3HelperLine
        .append('text')
        .attr('fill', 'green')
        .attr('stroke', 'none');

    this.d3Overlay = this.d3Container
        .append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .attr('opacity', 0)
        .on('mouseover', () => {
          this.d3HelperLine
              .transition()
              .attr('opacity', 1);
        })
        .on('mouseout', () => {
          this.d3HelperLine
              .transition()
              .attr('opacity', 0);
        });

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








