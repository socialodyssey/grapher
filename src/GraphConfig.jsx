import React from 'react';
import Checkbox from './Checkbox';

function GraphConfig({ handleChange, current }) {
  return (
    <div className="GraphConfig">
      <h2>Display</h2>
      <form className="Form">
        <Checkbox
            name="show-bridges"
            displayName="Show bridges"
            currentVal={current['show-bridges']}
            handleChange={handleChange} />
        <Checkbox
            name="show-edge-weight"
            displayName="Show edge weight"
            currentVal={current['show-edge-weight']}
            handleChange={handleChange} />
        <Checkbox
            name="show-cog"
            displayName="Show COG events"
            currentVal={current['show-cog']}
            handleChange={handleChange} />
        <Checkbox
            name="show-inr"
            displayName="Show INR events"
            currentVal={current['show-inr']}
            handleChange={handleChange} />
      </form>
    </div>
  )
}

export default GraphConfig;
