import React from 'react';

import DropdownInput from './DropdownInput';
import SocialLineGraph from './SocialLineGraph';

class LineGrapher extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showForm: true,
      character: 'Entities/97372' // Odysseus
    }
    
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  handleFormChange(name, val) {
    console.log(name, val)
    this.setState({
      [name]: val
    })
  }

  handleFormSubmit(e) {
    e.stopPropagation();
    e.preventDefault();

    this.setState({
      showForm: false
    })
  }
  
  render() {
    const { data } = this.props;
    const { character, showForm } = this.state;
    
    const { nodes } = data;

    const characterChoices = nodes.map((node) => ({
      id:   node.id,
      name: node.name
    }))

    if (showForm) {
      return (
        <form className="Form">
          <DropdownInput
              name="character"
              displayName="Character"
              handleChange={this.handleFormChange}
              choices={characterChoices}
              currentVal={this.state.character}
          />
          <input className="btn" type="submit" value="OK!" onClick={this.handleFormSubmit} />
        </form>
      )
    }

    return (
      <SocialLineGraph
          width={600}
          height={400}
          data={data}
          nodeID={character}
          book={4}
      />
    )
  }
}

export default LineGrapher;
