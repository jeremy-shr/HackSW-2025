import React, { useRef, useEffect } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./map.css";
import californiaGeoJSON from "./cali.json";  // Import JSON directly
import OverLay from "./OverLay";

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  // California Boundaries
  const californiaBounds = [
    [-138, 32], // Southwest corner (bottom-left)
    [-103, 43], // Northeast corner (top-right)
  ];

  // California center (for the marker)
  const californiaCenter = { lng: -120, lat: 38 };

  // Replace with your actual API key
  maptilersdk.config.apiKey = "SU349lPP5wocnc0jWRHK";

  useEffect(() => {
    if (map.current) return; // Prevent multiple map initializations

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      maxBounds: californiaBounds,
      minZoom: 5,
      maxZoom: 15,
    });

    // Fit California bounds on load
    map.current.fitBounds(californiaBounds, { padding: 50, maxZoom: 20 });

    // Add a marker at California center
    new maptilersdk.Marker({ color: "#000000" })
      .setLngLat([californiaCenter.lng, californiaCenter.lat])
      .addTo(map.current);

    map.current.on("load", () => {
      // Add California border from imported JSON
      map.current.addSource("california-border", {
        type: "geojson",
        data: californiaGeoJSON,
      });

      map.current.addLayer({
        id: "california-border-layer",
        type: "line",
        source: "california-border",
        paint: {
          "line-color": "#FF5733",
          "line-width": 3,
        },
      });
      
    });
  }, []);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
      <OverLay />
    </div>
  );
}
