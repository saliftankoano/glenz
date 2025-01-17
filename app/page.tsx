"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getRats } from "./actions/rats";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export interface RatSighting {
  location: {
    type: string;
    coordinates: [number, number];
  };
  created_date: string;
  incident_address: string;
  borough: string;
}

export default function Home() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const getRatsData = async () => {
      const rats = await getRats();
      // Transform the data into GeoJSON format
      const geojsonData: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: rats
          .filter((rat: RatSighting) => rat?.location?.coordinates)
          .map((rat: RatSighting) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [
                rat.location.coordinates[0],
                rat.location.coordinates[1],
              ],
            },
            properties: {
              sightings: 1, // Each point represents one sighting
              created_date: rat.created_date,
              address: rat.incident_address,
              borough: rat.borough,
            },
          })),
      };

      // If map is already initialized, update the source
      if (mapRef.current) {
        const source = mapRef.current.getSource(
          "rat-sightings"
        ) as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData(geojsonData);
        }
      }

      return geojsonData;
    };

    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        style: "mapbox://styles/tanksalif/cm1c4amlx00o301qkd5racncv",
        container: mapContainerRef.current,
        center: [-73.989357, 40.74855],
        zoom: 11.5,
      });

      // Add the data source and layer when the map loads
      mapRef.current.on("load", async () => {
        const geojsonData = await getRatsData();

        // Add the source with your rat sightings data
        mapRef.current?.addSource("rat-sightings", {
          type: "geojson",
          data: geojsonData,
        });

        // Add the heatmap layer
        mapRef.current?.addLayer({
          id: "rat-heat",
          type: "heatmap",
          source: "rat-sightings",
          paint: {
            // Increase weight based on number of sightings
            "heatmap-weight": [
              "interpolate",
              ["linear"],
              ["get", "sightings"],
              0,
              0,
              10,
              1,
            ],
            // Increase intensity as zoom level increases
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              1,
              15,
              3,
            ],
            // Color ramp for heatmap from green to red
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(33,102,0,0)",
              0.2,
              "rgb(103,169,0)",
              0.4,
              "rgb(209,229,0)",
              0.6,
              "rgb(253,219,0)",
              0.8,
              "rgb(239,138,0)",
              1,
              "rgb(186,0,0)",
            ],
            // Adjust the heatmap radius with zoom level
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              2,
              15,
              20,
            ],
            "heatmap-opacity": 0.8,
          },
        });
      });
    }

    // Cleanup function
    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    <div>
      <h1>Hello World</h1>
      <div ref={mapContainerRef} className="w-full h-[100vh]" />
    </div>
  );
}
