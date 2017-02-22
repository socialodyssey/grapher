import React      from 'react';
import classnames from 'classnames'
import '../style/Tabs.css';

class Tabs extends React.Component {
  render() {
    const { activeTab, changeHandler } = this.props;
    
    return (
      <div className="Tabs">
        <div className="btn-group">
          {
            this.props.tabs.map((tab) => {
              const classes = classnames('btn', {
                'btn-active': tab.key === activeTab
              })

              return (
                <button className={classes} key={tab.key} onClick={() => changeHandler(tab.key)}>
                  {tab.text}
                </button>
              )
            })
          }
        </div>
      </div>
    )
  }
}

export default Tabs;
