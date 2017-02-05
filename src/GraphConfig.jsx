import React from 'react';

function GraphConfig({ handleChange, current }) {
  return (
    <div className="GraphConfig">
      <form>
        <label htmlFor="show-bridges">Show bridges</label>
        <input type="checkbox" name="show-bridges" onChange={handleChange} checked={current['show-bridges']} />
      </form>
    </div>
  )
}

export default GraphConfig;
