import React from "react";
import Slider from "./TimeSlider";
import Board from "./Board";
import NavBar from "./NavBar";

function OverLay({ addFireMode, setAddFireMode }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
      {/* Top-right textbox */}
      <Board />

      {/* Bottom white bar */}
      <Slider />

      {/* Bottom-right button */}
      <NavBar setAddFireMode={setAddFireMode} />
    </div>
  );
}

export default OverLay;
