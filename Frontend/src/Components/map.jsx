import { useRef, useEffect, useState } from "react";

import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./map.css";
import californiaGeoJSON from "./cali.json"; // Import JSON directly
import OverLay from "./OverLay";
import caliFiresGeojson from "../../data/final_fires.json";
import pointJson from "./location.json";

function convertPointsToGeoJSON(pointJson) {
    return {
      type: "FeatureCollection",
      features: pointJson.data.map((point) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [point["Longitude"], point["Latitude"]], // Ensure correct order
        },
      })),
    };
}

export default function Map() {
  const [yearBounds, setYearBounds] = useState([1950, 2024]);
  const [filteredGeojson, setFilteredGeojson] = useState(filterFiresByYear(caliFiresGeojson, yearBounds));
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [showHouses, setShowHouses] = useState(false); // ✅ Toggle for blue dots

  // California Boundaries
  const californiaBounds = [
    [-138, 32], 
    [-103, 43], 
  ];

  const californiaCenter = { lng: -120, lat: 38 };

  // Replace with your actual API key
  maptilersdk.config.apiKey = "SU349lPP5wocnc0jWRHK";

  useEffect(() => {
    if (map.current) return; 

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.SATELLITE,
      maxBounds: californiaBounds,
      minZoom: 5,
      maxZoom: 15,
    });

    map.current.fitBounds(californiaBounds, { padding: 50, maxZoom: 20 });

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
        },
      });

      map.current.addSource("cali_fires", {
        type: "geojson",
        data: filteredGeojson, 
      });

      map.current.addLayer({
        id: "cali_fires_layer",
        type: "fill",
        source: "cali_fires",
        layout: {},
        paint: {
          "fill-color": "#FF5733",
          "fill-opacity": 0.5,
        },
      });
    });
  }, []);

  // ✅ Effect to Show/Hide Blue Dots Based on `showHouses`
  useEffect(() => {
    if (!map.current) return;

    if (showHouses) {
      if (!map.current.getSource("locations")) {
        map.current.addSource("locations", {
          type: "geojson",
          data: convertPointsToGeoJSON(pointJson), 
        });
      }

      if (!map.current.getLayer("blue-dots-layer")) {
        map.current.addLayer({
          id: "blue-dots-layer",
          type: "circle",
          source: "locations",
          paint: {
            "circle-radius": 2,
            "circle-color": "#0000FF", 
            "circle-opacity": 0.8,
          },
        });
      }
    } else {
      // ✅ Remove the layer if `showHouses` is false
      if (map.current.getLayer("blue-dots-layer")) {
        map.current.removeLayer("blue-dots-layer");
      }
      if (map.current.getSource("locations")) {
        map.current.removeSource("locations");
      }
    }
  }, [showHouses]); // ✅ Runs when `showHouses` changes

  useEffect(() => {
    const newFilteredGeojson = filterFiresByYear(caliFiresGeojson, yearBounds);
    setFilteredGeojson(newFilteredGeojson);

    if (map.current && map.current.getSource("cali_fires")) {
      map.current.getSource("cali_fires").setData(newFilteredGeojson);
    }
  }, [yearBounds]);

  return (
    <div className="map-wrap z-10">
      <div ref={mapContainer} className="map" />
      <OverLay showHouses={showHouses} setShowHouses={setShowHouses} yearBounds={yearBounds} setYearBounds={setYearBounds} />
    </div>
  );
}

// 🔥 Function to filter GeoJSON by year range
function filterFiresByYear(geojson, yearBounds) {
  const [minYear, maxYear] = yearBounds;
  return {
    type: "FeatureCollection",
    name: geojson.name,
    features: geojson.features.filter((feature) => {
      const fireYear = feature.properties.YEAR_;
      return fireYear >= minYear && fireYear <= maxYear;
    }),
  };
}
