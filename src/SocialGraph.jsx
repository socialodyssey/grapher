import React from 'react';
import axios from 'axios';
import Graph from './Graph';

const { REACT_APP_API_URL } = process.env;

class SocialGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      graphData: {}
    }

    this.fetchData = this.fetchData.bind(this);
  }

  fetchData() {
    const toFetch = [
      axios.get([REACT_APP_API_URL, 'entities'].join('/')).then(({ data }) => data),
      axios.get([REACT_APP_API_URL, 'interactions'].join('/')).then(({ data }) => data)
    ]

    Promise
      .all(toFetch)
      .then(([entities, interactions]) => {
        const transformedEntities = entities
          .map(({ _id, ...rest }) => ({
            id: _id,
            ...rest
          }))

        const transformedInteractions = interactions
          .map(({ _from, _to, ...rest }) => ({
            source: _from,
            target: _to,
            ...rest
          }))

        this.setState({
          graphData: {
            nodes: transformedEntities,
            links: transformedInteractions
          } 
        })
      })
      .catch((err) => console.error(err))
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    return (
      <div className="SocialGraph">
        <Graph data={this.state.graphData} />
      </div>
    )
  }
}

export default SocialGraph;
