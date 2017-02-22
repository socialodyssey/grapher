import React from 'react';
import InputRange from 'react-input-range';

import 'react-input-range/lib/css/index.css';
import '../style/RangeSlider.css';

function RangeSlider ({ title, value, handleChange, min, max }) {
  return (
    <div className="RangeSlider">
      <h2>{title}</h2>
      <InputRange
          minValue={min}
          maxValue={max}
          value={value}
          onChange={handleChange} />
    </div>
  )
}

export default RangeSlider;
