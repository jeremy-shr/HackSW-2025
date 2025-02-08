import React, { useRef, useEffect } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './map.css';

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  // California Boundaries (for fitting the map view)
  const californiaBounds = [
    [-131, 32], // Southwest corner (bottom-left)
    [-114.1312, 42.0095] // Northeast corner (top-right)
  ];

  // California center (for the marker)
  const californiaCenter = { lng: -120, lat: 38 };

  // Replace with your actual API key (store in environment variables for security)
  maptilersdk.config.apiKey = "SU349lPP5wocnc0jWRHK";

  useEffect(() => {
    if (map.current) return; // Prevents multiple map initializations

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      maxBounds: californiaBounds, // Restricts movement to California
      minZoom: 5, // Prevents zooming too far out
      maxZoom: 15 // Prevents excessive zooming in
    });

    // Fit the entire California boundary on load
    map.current.fitBounds(californiaBounds, { padding: 50, maxZoom: 20 });

    // Add a marker at the center of California
    new maptilersdk.Marker({ color: "#FF0000" })
      .setLngLat([californiaCenter.lng, californiaCenter.lat])
      .addTo(map.current);

  }, []);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}
