import React, { useState } from "react";
import dayjs from "dayjs";
import Slider from "@mui/material/Slider";

function TimeSlider() {
  const minDate = dayjs("2020-01-01");
  const maxDate = dayjs("2025-12-31");
  const minGap = 86400000; // 1 day in milliseconds

  const [value, setValue] = useState([minDate.valueOf(), maxDate.add(1, "day").valueOf()]);

  const handleChange = (event, newValue, activeThumb) => {
    let [start, end] = newValue;

    // Ensure minimum gap of 1 day
    if (end - start < minGap) {
      if (activeThumb === 0) {
        start = end - minGap;
      } else {
        end = start + minGap;
      }
    }

    // Prevent values from exceeding min/max bounds
    start = Math.max(start, minDate.valueOf());
    end = Math.min(end, maxDate.valueOf());

    setValue([start, end]);
  };

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white w-3/5 p-4 rounded-lg shadow-lg text-center pointer-events-auto">
      <p className="text-gray-800 font-semibold">Select Date Range</p>

      <Slider
        min={minDate.valueOf()}
        max={maxDate.valueOf()}
        step={86400000} // 1 day in ms
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        valueLabelFormat={(val) => dayjs(val).format("YYYY-MM-DD")}
        disableSwap
      />

      <div className="mt-2 flex justify-between text-sm text-gray-700">
        <span>Start: {dayjs(value[0]).format("YYYY-MM-DD")}</span>
        <span>End: {dayjs(value[1]).format("YYYY-MM-DD")}</span>
      </div>
    </div>
  );
}

export default TimeSlider;
