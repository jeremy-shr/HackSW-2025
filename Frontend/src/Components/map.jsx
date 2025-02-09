import { useRef, useEffect, useState } from "react";
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./map.css";
import californiaGeoJSON from "./cali.json";  // Import JSON directly
import OverLay from "./OverLay";

// Import your GeoJSON file (adjust the relative path as needed)
import caliFiresGeojson from '../../data/final_fires.json';

export default function Map() {
  const gradient = ['#371D32', '#88363F', '#F95952', '#F29890', '#ECD2CA']
  const mapContainer = useRef(null);
  const [count, setCount] = useState(0);
  const map = useRef(null);
  const [addFireMode, setAddFireMode] = useState(false);
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
      style: maptilersdk.MapStyle.SATELLITE,
      maxBounds: californiaBounds,
      minZoom: 5,
      maxZoom: 15,
    });

    // Fit California bounds on load
    map.current.fitBounds(californiaBounds, { padding: 50, maxZoom: 20 });

    // map.current.on('click', function (e) {
    //   console.log(e.lngLat);
    // });

    map.current.on("click", async (event) => {
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
                      "fill-color": gradient[index % gradient.length], // Cycle colors
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
    });



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
        }
      }),
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
    });
  }, []);

  return (
    <div className="map-wrap z-10">
      <div ref={mapContainer} className="map" />
      <OverLay setAddFireMode={setAddFireMode} addFireMode={addFireMode} />
    </div>
  );
}