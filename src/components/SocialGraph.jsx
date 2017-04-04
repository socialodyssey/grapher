import React from 'react';
import Graph from './Graph';
import '../style/SocialGraph.css';

class SocialGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: document.body.clientWidth,
      height: window.innerHeight * 0.80
    }

    this.handleResize = this.handleResize.bind(this);
  }

  handleResize() {
    this.setState({
      width: document.body.clientWidth,
      height: window.innerHeight * 0.80
    })
  }
  
  componentDidMount() {
    window.addEventListener('resize', this.handleResize)

    this.handleResize()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }
  
  render() {
    const { width, height } = this.state;

    const { data } = this.props

    return (
      <div className="SocialGraph" style={{
        overflow: 'hidden',
        width:  width + 'px',
        height: height + 'px'
      }}>
        <Graph
            {...this.props}
            data={data}
            width={width}
            height={height}
        />
      </div>
    )
  }
}

export default SocialGraph;
