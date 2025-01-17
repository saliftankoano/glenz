"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function Home() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        style: "mapbox://styles/tanksalif/cm1c4amlx00o301qkd5racncv",
        container: mapContainerRef.current,
        center: [-73.989357, 40.74855],
        zoom: 11.5,
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
