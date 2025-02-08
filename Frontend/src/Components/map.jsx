import { useRef, useEffect } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './map.css';

// Import your GeoJSON file (adjust the relative path as needed)
import caliFiresGeojson from '../../data/final_fires.json';

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  console.log(caliFiresGeojson)

  // California Boundaries (for fitting the map view)
  const californiaBounds = [
    [-138, 32], // Southwest corner (bottom-left)
    [-103, 43]  // Northeast corner (top-right)
  ];

  // Replace with your actual API key (store in environment variables for security)
  maptilersdk.config.apiKey = "SU349lPP5wocnc0jWRHK";

  useEffect(() => {
    if (map.current) return; // Prevents multiple map initializations

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      maxBounds: californiaBounds, // Restricts movement to California
      minZoom: 0, // Prevents zooming too far out
      maxZoom: 15 // Prevents excessive zooming in
    });

    // Fit the entire California boundary on load
    map.current.fitBounds(californiaBounds, { padding: 50, maxZoom: 20 });



    // Wait for the map to load before adding the GeoJSON layer
    map.current.on('load', () => {
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
    </div>
  );
}