import React from 'react'

export default function DropdownInput({ name, displayName, choices, currentVal, handleChange }) {
  return (
    <div className="input-dropdown">
      <span>{displayName}</span>
      <select name={name} onChange={(e) => handleChange(name, e.target.value)} value={currentVal}>
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
