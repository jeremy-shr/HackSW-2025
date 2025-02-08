import React from 'react'
import { FaMapMarkerAlt, FaSearch, FaLayerGroup } from "react-icons/fa";

function WMHB({setOpenModal}) {
  return (
        <button
        onClick={() => setOpenModal(true)}
        className="flex items-center justify-center w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
      >
        <FaHouseCrack  size={24} />
      </button>
  )
}

export default WMHB