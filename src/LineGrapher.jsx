import React from 'react';

import DropdownInput from './DropdownInput';
import SocialLineGraph from './SocialLineGraph';

class LineGrapher extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showForm:  true,
      characters: ['Entities/97372'] // Odysseus
    }
    
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleAddCharacter = this.handleAddCharacter.bind(this);
    this.randomEntity = this.randomEntity.bind(this);
  }

  handleFormChange(name, val) {
    const index  = name.split('-')[1];
    let   newArr = this.state.characters.slice(0);
    newArr[index] = val;
    
    this.setState({
      characters: newArr
    })
  }

  handleFormSubmit(e) {
    e.stopPropagation();
    e.preventDefault();

    this.setState({
      showForm: false
    })
  }

  handleAddCharacter(e) {
    e.stopPropagation();
    e.preventDefault();

    let newArr = this.state.characters.slice(0);
    newArr.push(this.randomEntity())

    this.setState({
      characters: newArr
    })
  }
  
  randomEntity() {
    const { data } = this.props
    
    if(!data) {
      return ''
    }
    
    const len = data.nodes.length;

    if(!len) {
      return ''
    }

    return data.nodes[Math.floor(Math.random()*len)]._id
  }
  
  render() {
    const { data } = this.props;
    const { characters, showForm } = this.state;
    
    const { nodes } = data;

    const characterChoices = nodes.map((node) => ({
      id:   node.id,
      name: node.name
    }))
    .sort((a, b) => b.name < a.name ? 1 : -1)

    if (showForm) {
      return (
        <form className="Form">
          {
            characters.map((character, index) => {
              return (
                <DropdownInput
                    key={index}
                    name={'character-' + index}
                    handleChange={this.handleFormChange}
                    choices={characterChoices}
                    currentVal={character}
                />
              )
            })
          }
          <button className="btn" onClick={this.handleAddCharacter}>Add Character</button>
          <input className="btn" type="submit" value="OK!" onClick={this.handleFormSubmit} />
        </form>
      )
    }

    return (
      <SocialLineGraph
          width={600}
          height={400}
          data={data}
          nodeIDs={characters}
      />
    )
  }
}

export default LineGrapher;
