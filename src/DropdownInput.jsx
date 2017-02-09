import React from 'react'

export default function DropdownInput({ name, displayName, choices, currentVal, handleChange }) {
  return (
    <div className="DropdownInput">
      <span className="label">{displayName}</span>
      <select className="select" name={name} onChange={(e) => handleChange(name, e.target.value)} value={currentVal}>
        {
          choices.map((choice) => {
            return (
              <option value={choice.id} key={choice.id}>{choice.name}</option>
            )
          })
        }
      </select>
    </div>
  )
}
