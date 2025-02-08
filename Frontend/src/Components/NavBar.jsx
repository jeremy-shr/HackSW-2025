import React, { useState } from "react";
import { FaMapMarkerAlt, FaSearch, FaLayerGroup } from "react-icons/fa";
import { FaHouseFire } from "react-icons/fa6";
import FormModal from "./FormModal";

function NavBar() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-4 z-50 pointer-events-auto">
      {/* Marker Icon (Opens Modal) */}
      <button
        onClick={() => setOpenModal(true)}
        className="flex items-center justify-center w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
      >
        <FaHouseFire size={24} />
      </button>

      {/* Search Icon */}
      <button className="flex items-center justify-center w-14 h-14 bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-800 transition">
        <FaSearch size={24} />
      </button>

      {/* Layers Icon */}
      <button className="flex items-center justify-center w-14 h-14 bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-800 transition">
        <FaLayerGroup size={24} />
      </button>

      {/* 🔥 Modal */}
      <FormModal open={openModal} handleClose={() => setOpenModal(false)} />
    </div>
  );
}

export default NavBar;
