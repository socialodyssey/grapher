import React from 'react';
import InputRange from '../node_modules/react-input-range';

import 'react-input-range/lib/css/index.css';

function RangeSlider ({ value, handleChange, min, max }) {
  return (
    <div className="RangeSlider">
      <h2>Book</h2>
      <InputRange
          minValue={min}
          maxValue={max}
          value={value}
          onChange={handleChange} />
    </div>
  )
}

export default RangeSlider;
