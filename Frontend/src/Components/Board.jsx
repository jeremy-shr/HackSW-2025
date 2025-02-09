import React from 'react'

function Board() {
  return (
    <div className="bg-white p-3 rounded shadow-lg w-60 pointer-events-auto z-20">
      <input
        type="text"
        placeholder="Enter text..."
        className="w-full p-2 border border-gray-300 rounded outline-none"
      />
    </div>
  )
}

export default Board