import { useRef, useEffect, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./map.css";
import californiaGeoJSON from "./cali.json"; // Import JSON directly
import OverLay from "./OverLay";
import caliFiresGeojson from "../../data/final_fires.json";
import pointJson from "./location.json";

export default function Map() {

  const gradient = ['#371D32', '#88363F', '#F95952', '#F29890', '#ECD2CA']
  const [yearBounds, setYearBounds] = useState([1950, 2024]);
  const [filteredGeojson, setFilteredGeojson] = useState(filterFiresByYear(caliFiresGeojson, yearBounds));
  const [filteredHouses, setFilteredHouses] = useState(filterHousesByYear(pointJson, yearBounds));
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [addFireMode, setAddFireMode] = useState(false);
  const addFireModeRef = useRef(addFireMode); // <-- Ref to store latest state

  // Keep the ref updated when `addFireMode` changes
  useEffect(() => {
    addFireModeRef.current = addFireMode;
    if (map.current) {
      map.current.getCanvas().style.cursor = addFireMode ? "crosshair" : "grab";
    }
  }, [addFireMode]);

  console.log(caliFiresGeojson)
  console.log(addFireMode)
  const [markers, setMarkers] = useState([]);

  const requestEndpoint = async (longitude, latitude) => {
    try {
      const response = await fetch(`http://localhost:8000/api/simulatePoints?latitude=${latitude}&longitude=${longitude}`);
      const data = await response.json();
      console.log(data);
      return data;
      // Handle the data as needed
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  };
  const [showHouses, setShowHouses] = useState(false); // ✅ Toggle for blue dots

  console.log(filteredHouses)
  // California Boundaries
  const californiaBounds = [
    [-138, 32], 
    [-103, 43], 
  ];

  const californiaCenter = { lng: -120, lat: 38 };

  // Replace with your actual API key
  maptilersdk.config.apiKey = "SU349lPP5wocnc0jWRHK";

  useEffect(() => {
    if (map.current) return; // Prevent multiple map initializations

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.SATELLITE,
      maxBounds: californiaBounds,
      minZoom: 5,
      maxZoom: 15,
    });

    map.current.fitBounds(californiaBounds, { padding: 50, maxZoom: 20 });
    if (addFireModeRef.current) {
      map.current.getCanvas().style.cursor = "crosshair";
    }
    // map.current.on('click', function (e) {
    //   console.log(e.lngLat);
    // });

    map.current.on("click", async (event) => {
      console.log("Clicked! ", addFireMode);
      if (addFireModeRef.current) {
        const { lng, lat } = event.lngLat;
        console.log("Clicked at: ", lng, lat);

        // Create a custom marker element using the correct path.
        const markerElement = document.createElement("img");
        markerElement.src = "/3d-fire.png"; // Make sure this image is in your public folder
        markerElement.style.width = "40px";
        markerElement.style.height = "40px";

        // Create and add a marker using the custom element.
        const newMarker = new maptilersdk.Marker({ element: markerElement })
          .setLngLat([lng, lat])
          .addTo(map.current);

        // Fetch the polygon data based on the click.
        try {
          const polygonData = await requestEndpoint(lng, lat);

          if (Array.isArray(polygonData)) {
            for (let index = 0; index < polygonData.length; index++) {
              const polygon = polygonData[index];

              const sourceId = `polygon-source-${lng}-${lat}-${index}`;
              const layerId = `polygon-layer-${lng}-${lat}-${index}`;

              await new Promise((resolve) => {
                setTimeout(() => {
                  map.current.addSource(sourceId, {
                    type: "geojson",
                    data: polygon
                  });

                  // Get the previous layer ID (so the new one is inserted *before* it)
                  const beforeLayerId =
                    index === 0 ? undefined : `polygon-layer-${lng}-${lat}-${index - 1}`;

                  // Add the polygon layer with `beforeId` to insert it *before* the previous one
                  map.current.addLayer(
                    {
                      id: layerId,
                      type: "fill",
                      source: sourceId,
                      layout: {},
                      paint: {
                        "fill-color": gradient[index], // Cycle colors
                        "fill-opacity": 0.5,
                      },
                    },
                    beforeLayerId // Insert before the previous polygon layer
                  );

                  resolve();
                }, 1000);
              });
            }
          } else {
            console.error("Polygon data is not an array", polygonData);
          }
        } catch (error) {
          console.error("Error fetching or processing polygon data:", error);
        }
        // Store the marker in state (if needed for later reference).
        setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
      }


    });



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
        },
      });

      // 🔥 Add Fire Layer
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

      // 🔵 Add House Layer (Initially Hidden)
      if (showHouses) {
        map.current.addSource("locations", {
          type: "geojson",
          data: filteredHouses,
        });

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
    });
  }, []);

  // ✅ Effect to update fires & houses dynamically when yearBounds change
  useEffect(() => {
    const newFilteredGeojson = filterFiresByYear(caliFiresGeojson, yearBounds);
    setFilteredGeojson(newFilteredGeojson);

    if (map.current && map.current.getSource("cali_fires")) {
      map.current.getSource("cali_fires").setData(newFilteredGeojson);
    }

    const newFilteredHouses = filterHousesByYear(pointJson, yearBounds);
    setFilteredHouses(newFilteredHouses);

    if (map.current && map.current.getSource("locations")) {
      map.current.getSource("locations").setData(newFilteredHouses);
    }
  }, [yearBounds]);

  // ✅ Effect to Show/Hide Blue Dots Based on `showHouses`
  useEffect(() => {
    if (!map.current) return;

    if (showHouses) {
      if (!map.current.getSource("locations")) {
        map.current.addSource("locations", {
          type: "geojson",
          data: filteredHouses, 
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
  }, [showHouses]); 

  return (
    <div className="map-wrap z-10">
      <div ref={mapContainer} className="map" />
      <OverLay setAddFireMode={setAddFireMode} addFireMode={addFireMode} yearBounds={yearBounds} setYearBounds={setYearBounds} showHouses={showHouses} setShowHouses={setShowHouses}/>
    </div>
  );
}

// 🔥 Function to filter GeoJSON Fires by Year
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

// 🔵 Function to filter Houses (Blue Dots) by Year
function filterHousesByYear(pointJson, yearBounds) {
  const [minYear, maxYear] = yearBounds;

  return {
    type: "FeatureCollection",
    features: pointJson.data
      .filter((point) => point.YEAR_ >= minYear && point.YEAR_ <= maxYear) // ✅ Filter by year
      .map((point) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [point.Longitude, point.Latitude], // ✅ Ensure correct order: [lng, lat]
        },
      })),
  };
}
