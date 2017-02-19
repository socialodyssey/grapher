import React from 'react';

class SocialStats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sortBy: 'weighted'
    }

    this.handleHeaderClick = this.handleHeaderClick.bind(this);
  }

  handleHeaderClick(e) {
    const { textContent } = e.target;

    let key = '';
    
    switch(textContent) {
      case 'Out-degree':
        key = 'out'
        break;
      case 'Out-weight':
        key = 'outWeighted'
        break;
      case 'In-degree':
        key = 'in'
        break;
      case 'In-weight':
        key = 'inWeighted'
        break;
      case 'Weighted total':
        key = 'weighted'
        break;
      default:
        break;
    }

    if(key) {
      this.setState({
        sortBy: key
      })
    }
  }
  
  render() {
    const { sortBy } = this.state;

    return (
      <table className="SocialStats">
        <tbody>
          <tr onClick={this.handleHeaderClick}>
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
                  if(a.centrality[sortBy] === b.centrality[sortBy]) {
                    return b.name < a.name ? 1 : -1;
                  }

                  return b.centrality[sortBy] - a.centrality[sortBy];
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
