import React            from 'react';
import Graph            from './Graph';
import InteractionModal from './InteractionModal';

import '../style/SocialGraph.css';

class SocialGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width:                document.body.clientWidth,
      height:               window.innerHeight * 0.80,
      interactionModalOpen: false
    }

    this.handleResize           = this.handleResize.bind(this);
    this.handleInteractionClick = this.handleInteractionClick.bind(this);
  }

  handleResize() {
    this.setState({
      width: document.body.clientWidth,
      height: window.innerHeight * 0.80
    })
  }

  handleInteractionClick(interaction) {
    this.setState({
      selectedInteraction: interaction
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
    const { width, height, selectedInteraction } = this.state;

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
            handleInteractionClick={this.handleInteractionClick}
        />
        <InteractionModal isOpen={!!selectedInteraction} selectedInteraction={selectedInteraction} handleClose={() => this.setState({ selectedInteraction: null })}/>
      </div>
    )
  }
}

export default SocialGraph;
