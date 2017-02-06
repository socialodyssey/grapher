import React from 'react';

class SocialStats extends React.Component {
  render() {
    return (
      <table className="SocialStats">
        <tbody>
          <tr>
            <th>Character</th>
            <th>Out-degree</th>
            <th>Out-weight</th>
            <th>In-degree</th>
            <th>In-weight</th>
            <th>Total</th>
            <th>Weighted total</th>
          </tr>
          {
            this.props.data.nodes
                .sort((a, b) => {
                  if(a.centrality.weighted === b.centrality.weighted) {
                    return b.name < a.name ? 1 : -1;
                  }

                  return b.centrality.weighted - a.centrality.weighted;
                })
                .map((d) => {
                  return (
                    <tr key={d.name}>
                      <td>{d.name}</td>
                      <td>{d.centrality.out}</td>
                      <td>{d.centrality.outWeighted}</td>
                      <td>{d.centrality.in}</td>
                      <td>{d.centrality.inWeighted}</td>
                      <td>{d.centrality.in + d.centrality.out}</td>
                      <td>{d.centrality.weighted}</td>
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
