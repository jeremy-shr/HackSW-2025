import React, { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import PlayButton from "./PlayButton";

function TimeSlider({ yearBounds, setYearBounds }) {
  const minYear = 1950;
  const maxYear = 2025;
  const minGap = 1; // Minimum 1-year gap

  const [isPlaying, setIsPlaying] = useState(false); // Use by play button

  const handleChange = (event, newValue) => {
    // Ensure newValue is an array (MUI sometimes passes a single value)
    if (!Array.isArray(newValue)) return;

    let [start, end] = newValue;

    // Ensure minimum gap of 1 year
    if (end - start < minGap) {
      if (start === yearBounds[0]) {
        end = start + minGap;
      } else {
        start = end - minGap;
      }
    }

    // Prevent values from exceeding min/max bounds
    start = Math.max(start, minYear);
    end = Math.min(end, maxYear);

    // ✅ Update the state using setYearBounds
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
  
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, minYear, maxYear, setYearBounds, setIsPlaying]);
  

<<<<<<< Updated upstream
    return (
      <div className="h-26 absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-lg border border-white/20 w-3/5 p-4 rounded-lg shadow-lg text-center pointer-events-auto drop-shadow-xl">
        <div className="flex items-center justify-between px-2 space-x-4">
          <Slider
            min={minYear}
            max={maxYear}
            step={1}
            value={yearBounds}
            onChange={handleChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(val) => `${val}`}
            disableSwap
          />

          <PlayButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
        </div>
    
        <div className="mt-2 flex justify-between text-sm text-white-700 ">
          <span>Start Year: {yearBounds[0]}</span>
          <span>End Year: {yearBounds[1]}</span>
        </div>
      </div>
    );
  }
=======
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md w-3/5 p-4 rounded-lg shadow-lg text-center pointer-events-auto border border-white/30">
  <p className="text-[#FF3B30] font-semibold">Select Year Range</p>

  {/* 🎨 Styled Slider */}
  <Slider
    min={minYear}
    max={maxYear}
    step={1} // 1 year per step
    value={yearBounds}
    onChange={handleChange}
    valueLabelDisplay="auto"
    valueLabelFormat={(val) => `${val}`} // Display year
    disableSwap
    sx={{
      color: "#FF3B30", // 🔴 Reddish color
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
    <div className="bg-white/30 px-1 py-1 rounded-lg shadow-md text-[#FF3B30]">{yearBounds[0]}</div>
    
    <PlayButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} />

    <div className="bg-white/30 px-1 py-1 rounded-lg shadow-md text-[#FF3B30]">{yearBounds[1]}</div>
  </div>
</div>

  );
}
>>>>>>> Stashed changes

export default TimeSlider;
