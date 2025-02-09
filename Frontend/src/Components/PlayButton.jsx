import React from "react";
import { FaPlay, FaPause } from 'react-icons/fa';

function PlayButton({ isPlaying, setIsPlaying }) {
    return (
        <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="flex items-center justify-center w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
        >
        {isPlaying ?  (
        <FaPause className="h-6 w-6" />
      ) : (
        <FaPlay className="h-6 w-6" />
      )}
        </button>
    );
}

export default PlayButton;
