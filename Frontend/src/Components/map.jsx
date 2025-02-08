import { useRef, useEffect } from "react";
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./map.css";
import californiaGeoJSON from "./cali.json";  // Import JSON directly
import OverLay from "./OverLay";

// Import your GeoJSON file (adjust the relative path as needed)
import caliFiresGeojson from '../../data/final_fires.json';

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  console.log(caliFiresGeojson)

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

      


    // Wait for the map to load before adding the GeoJSON layer
    map.current.on('load', () => {
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
        }}),
      // Add the GeoJSON source
      new maptilersdk.Marker()
        .setLngLat([-122.91147670, 41.5320111609497])
        .addTo(map.current);

      map.current.addSource('cali_fires', {
        type: 'geojson',
        data: caliFiresGeojson
      });

      // Add a fill layer to style the polygons
      map.current.addLayer({
        id: 'cali_fires_layer',
        type: 'fill',
        source: 'cali_fires',
        layout: {},
        paint: {
          'fill-color': '#FF5733', // Choose your fill color
          'fill-opacity': 0.5      // Adjust opacity as desired
        }
      });
      // (Optional) Add a line layer to outline the polygons
      // map.current.addLayer({
      //   id: 'cali_fires_outline',
      //   type: 'line',
      //   source: 'cali_fires',
      //   layout: {},
      //   paint: {
      //     'line-color': '#FF0000',
      //     'line-width': 2
      //   }
      // });
    });
  }, []);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
      <OverLay />
    </div>
  );
}