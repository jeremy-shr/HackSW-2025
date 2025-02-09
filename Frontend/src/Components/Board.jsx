import React, { useState } from 'react';
import InformationModal from './InformationModal';
import fire_bg from '../assets/fire_bg.webp';

function Board() {
  const [openDataModal, setOpenDataModal] = useState(false);

  return (
    <>
      <div className="absolute top-5 left-5 bg-[<fire_bg>] p-3 rounded shadow-lg w-60 text-black pointer-events-auto">
        <h1>Wildfire Data</h1>
        <p>
          Visualizing historical fire data from the 1950s to 2025.
        </p>
        <button
          onClick={() => setOpenDataModal(true)}
          className="bg-blue-500 text-white px-3 py-1 rounded mt-2 shadow-lg hover:bg-blue-600 transition"
        >
          About the data
        </button>
      </div>
      {openDataModal && (
          <InformationModal
          open={openDataModal}
          handleClose={() => setOpenDataModal(false)}
          title="About the data"
          bodyText="Using ove 100,000 data points on fire building damage and 20,000 data points on historical fire data between 1950 and 2025."
        />
      )}
    </>
  );
}

export default Board;
