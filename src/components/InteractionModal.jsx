import React      from 'react';
import ReactModal from 'react-modal';

import '../style/InteractionModal.css';

export default class InteractionModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tab: 'home'
    }

    this.renderBody  = this.renderBody.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleClose() {
    this.props.handleClose()
    
    this.setState({
      tab: 'home'
    })
  }

  renderPane(data) {
    return (
      <div className="interactions">
        {
          data
            .sort((a, b) => a.selection.from_line - b.selection.from_line)
            .map(({ id, selection, type}) => {
              return (
                <div className="interaction" key={id}>
                  <span className="line-no">Line {selection.from_line}&ndash;{selection.to_line}</span>
                  <span className="type">{type}</span>
                </div>
              )
            })
        }
      </div>
    )
  }

  renderBody() {
    const { selectedInteraction } = this.props;
    const { source, target, inWeight, outWeight } = selectedInteraction;
    const { tab } = this.state;

    if(tab === 'source') {
      return this.renderPane(selectedInteraction.out)
    }

    if(tab === 'target') {
      return this.renderPane(selectedInteraction.in)
    }

    return (
        <div className="info">
          <h2 className="info-bite" onClick={() => this.setState({ tab: 'source' })}>{source.name} Weight: {outWeight}</h2>
          <h2 className="info-bite" onClick={() => this.setState({ tab: 'target' })}>{target.name} Weight: {inWeight}</h2>
        </div>
    )
  }

  render() {
    const { isOpen, selectedInteraction } = this.props;

    if(!selectedInteraction) {
      return <div>Loading&hellip;</div>
    }
    
    const { source, target } = selectedInteraction;
    
    return (
      <ReactModal isOpen={isOpen} className="InteractionModal" onRequestClose={this.handleClose} contentLabel="Modal for viewing interaction details">
        <div className="title" onClick={() => this.setState({ tab: 'home' })}>
          <h1>From &lsquo;{source.name}&rsquo; to &lsquo;{target.name}&rsquo;</h1>
        </div>

        {this.renderBody()}

      </ReactModal>
    )
  }
}
