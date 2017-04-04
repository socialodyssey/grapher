import React     from 'react';
import className from 'classnames';

import '../style/ToolSelector.css';

const TOOLS = [
  {
    name: 'highlight'
  },
  {
    name: 'remove'
  }
]

export default function ToolSelector ({ handleChangeTool, currentVal }) {
  return (
    <div className="ToolSelector btn-group -verticle">
      {
        TOOLS.map((tool) => (
          <button
              className={
                className('btn', {
                  'btn-active': tool.name === currentVal
                })
              }
              key={tool.name}
              onClick={handleChangeTool.bind(null, tool.name)}>{tool.name}</button>
        ))
      }
    </div>
  )
}
