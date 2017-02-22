import React from 'react'
import '../style/DropdownInput.css'

export default function DropdownInput({ name, displayName, choices, currentVal, handleChange, onRemove }) {
  return (
    <div className="DropdownInput">
      {displayName &&
       <span className="label">{displayName}</span>
      }
      <select className="select" name={name} onChange={(e) => handleChange(name, e.target.value)} value={currentVal}>
        {
          choices.map((choice) => {
            return (
              <option value={choice.id} key={choice.id}>{choice.name}</option>
            )
          })
        }
      </select>
      {onRemove &&
       <span className="remove" onClick={onRemove}>x</span>
      }
    </div>
  )
}
