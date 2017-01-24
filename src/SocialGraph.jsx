import React from 'react';
import Graph from './Graph';
import interactions from './data/interactions';
import entities from './data/entities';

class SocialGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight * 0.66
    }
  }
  
  componentDidMount() {
    window.addEventListener('resize', () => {
      this.setState({
        width: window.innerWidth,
        height: window.innerHeight * 0.66
      })
    })
  }
  render() {
    const { width, height } = this.state;
    
    return (
      <div className="SocialGraph" style={{
        overflow: 'hidden',
        width:  width + 'px',
        height: height + 'px'
      }}>
        <Graph data={this.props.data} width={width} height={height} />
      </div>
    )
  }
}

export default SocialGraph;
