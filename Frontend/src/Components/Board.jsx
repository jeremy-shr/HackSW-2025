import React from 'react'

function Board() {
  return (
    <div className="absolute top-5 left-5 bg-white p-3 rounded shadow-lg w-60 pointer-events-auto">
        <input 
          type="text" 
          placeholder="Enter text..." 
          className="w-full p-2 border border-gray-300 rounded outline-none"
        />
      </div>
  )
}

export default Board