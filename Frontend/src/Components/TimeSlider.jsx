import React, { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import PlayButton from "./PlayButton";

function TimeSlider({ yearBounds, setYearBounds }) {
  const minYear = 1950;
  const maxYear = 2025;
  const minGap = 1; // Minimum 1-year gap

  const [isPlaying, setIsPlaying] = useState(false); // Controlled by play button

  const handleChange = (event, newValue) => {
    if (!Array.isArray(newValue)) return; // Ensure newValue is an array

    let [start, end] = newValue;

    // Ensure a minimum gap of 1 year
    if (end - start < minGap) {
      if (start === yearBounds[0]) {
        end = start + minGap;
      } else {
        start = end - minGap;
      }
    }

    // Keep values within bounds
    start = Math.max(start, minYear);
    end = Math.min(end, maxYear);

    setYearBounds([start, end]);
  };

  useEffect(() => {
    let intervalId;

    if (isPlaying) {
      setYearBounds((prevBounds) => {
        const [start, currentYear] = prevBounds;
        return currentYear === maxYear ? [minYear, minYear] : prevBounds;
      });

      intervalId = setInterval(() => {
        setYearBounds((prevBounds) => {
          const [start, currentYear] = prevBounds;
          if (currentYear < maxYear) {
            return [start, currentYear + 1];
          } else {
            clearInterval(intervalId);
            setIsPlaying(false);
            return prevBounds;
          }
        });
      }, 250);
    }

    return () => clearInterval(intervalId);
  }, [isPlaying, setYearBounds]);

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-lg border border-white/20 w-3/5 p-4 rounded-lg shadow-lg text-center pointer-events-auto drop-shadow-xl">
      <p className="text-[#FF3B30] font-semibold">Select Year Range</p>

      {/* 🎨 Styled Slider */}
      <Slider
        min={minYear}
        max={maxYear}
        step={1}
        value={yearBounds}
        onChange={handleChange}
        valueLabelDisplay="auto"
        valueLabelFormat={(val) => `${val}`}
        disableSwap
        sx={{
          color: "#FF3B30", 
          '& .MuiSlider-thumb': {
            backgroundColor: "#FF3B30", // Thumb color
            boxShadow: "0px 0px 10px rgba(255, 59, 48, 0.5)", // Glowing effect
          },
          '& .MuiSlider-track': {
            backgroundColor: "#FF3B30", // Track color
          },
          '& .MuiSlider-rail': {
            backgroundColor: "#FFC1BC", // Light reddish rail
          },
        }}
      />

      <div className="mt-2 flex justify-between text-sm text-gray-700">
        <div className="bg-white/30 px-3 py-1 rounded-lg shadow-md text-[#FF3B30]">{yearBounds[0]}</div>

        <PlayButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} />

        <div className="bg-white/30 px-3 py-1 rounded-lg shadow-md text-[#FF3B30]">{yearBounds[1]}</div>
      </div>
    </div>
  );
}

export default TimeSlider;
