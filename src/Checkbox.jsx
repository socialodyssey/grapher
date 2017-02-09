import React from 'react'

export default function Checkbox({ name, displayName, currentVal, handleChange }) {
  return (
    <div className="Checkbox">
        <label htmlFor={name}>{displayName}</label>
        <input type="checkbox" name={name} onChange={handleChange} checked={currentVal} />
    </div>
  )
}
