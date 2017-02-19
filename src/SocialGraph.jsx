import React from 'react';
import Graph from './Graph';
import interactions from './data/interactions';
import entities from './data/entities';

class SocialGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: document.body.clientWidth,
      height: window.innerHeight * 0.66
    }

    this.handleResize = this.handleResize.bind(this);
  }

  handleResize() {
    this.setState({
      width: document.body.clientWidth,
      height: window.innerHeight * 0.66
    })
  }
  
  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }
  
  render() {
    const { width, height } = this.state;
    
    return (
      <div className="SocialGraph" style={{
        overflow: 'hidden',
        width:  width + 'px',
        height: height + 'px'
      }}>
        <Graph
            {...this.props}
            data={this.props.data}
            width={width}
            height={height}
        />
      </div>
    )
  }
}

export default SocialGraph;
