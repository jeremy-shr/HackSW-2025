import React from "react";

function InformationModal({ open, handleClose, title, bodyText }) {
    return (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white p-5 rounded shadow-lg w-80 pointer-events-auto text-black">
        <h2 className="text-xl font-bold mb-3">{title}</h2>
        <p>{bodyText}</p>
        <button
            onClick={handleClose}
            className="mt-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        >
            Close
        </button>
        </div>
    );
}

export default InformationModal;
