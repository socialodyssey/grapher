import React from 'react';

class SocialStats extends React.Component {
  render() {
    return (
      <table className="SocialStats">
        <tbody>
          <tr>
            <th>Character</th>
            <th>Centrality</th>
          </tr>
          {
            this.props.data.nodes
                .sort((a, b) => b.centrality - a.centrality)
                .map((d) => {
                  return (
                    <tr key={d.name}>
                      <td>{d.name}</td>
                      <td>{d.centrality}</td>
                    </tr>
                  )
                })
          }
        </tbody>
      </table>
    )
  }
}

export default SocialStats;
