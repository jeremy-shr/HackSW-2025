import { useRef, useEffect, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./map.css";
import californiaGeoJSON from "./cali.json"; // Import JSON directly
import OverLay from "./OverLay";
import caliFiresGeojson from "../../data/final_fires.json";

export default function Map() {
  const [yearBounds, setYearBounds] = useState([1950, 2024]);
  const [filteredGeojson, setFilteredGeojson] = useState(filterFiresByYear(caliFiresGeojson, yearBounds));

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

    map.current.fitBounds(californiaBounds, { padding: 50, maxZoom: 20 });

    new maptilersdk.Marker({ color: "#000000" })
      .setLngLat([californiaCenter.lng, californiaCenter.lat])
      .addTo(map.current);

    map.current.on("load", () => {
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
        data: filteredGeojson, // Use filtered data
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

    //   map.current.addLayer({
    //     id: "cali_fires_outline",
    //     type: "line",
    //     source: "cali_fires",
    //     layout: {},
    //     paint: {
    //       "line-color": "#FF0000",
    //       "line-width": 2,
    //     },
    //   });
    });
  }, []);

  useEffect(() => {
    const newFilteredGeojson = filterFiresByYear(caliFiresGeojson, yearBounds);
    setFilteredGeojson(newFilteredGeojson);

    if (map.current && map.current.getSource("cali_fires")) {
      map.current.getSource("cali_fires").setData(newFilteredGeojson);
    }
  }, [yearBounds]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
      <OverLay yearBounds={yearBounds} setYearBounds={setYearBounds} />
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
