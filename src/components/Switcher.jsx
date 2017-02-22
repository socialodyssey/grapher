import React from 'react';

function TabSwitcher({ show, children }) {
  let tabToRender = children;

  if(children.length) {
    tabToRender = children.filter(c => c.props['data-tabkey'] === show)[0];
  }

  return (
    <div className="TabSwitcher">
      {tabToRender}
    </div>
  )
    
}

export default TabSwitcher;
