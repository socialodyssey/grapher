import React from 'react';

class SocialStats extends React.Component {
  render() {
    return (
      <table className="SocialStats">
        <tbody>
          <tr>
            <th>Character</th>
            <th>Out-degree</th>
            <th>In-degree</th>
            <th>Total</th>
          </tr>
          {
            this.props.data.nodes
                .sort((a, b) => {
                  const ac = a.centrality.in + a.centrality.out;
                  const bc = b.centrality.in + b.centrality.out;

                  if(ac === bc) {
                    return b.name < a.name ? 1 : -1;
                  }

                  return bc - ac;
                })
                .map((d) => {
                  return (
                    <tr key={d.name}>
                      <td>{d.name}</td>
                      <td>{d.centrality.out}</td>
                      <td>{d.centrality.in}</td>
                      <td>{d.centrality.in + d.centrality.out}</td>
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
