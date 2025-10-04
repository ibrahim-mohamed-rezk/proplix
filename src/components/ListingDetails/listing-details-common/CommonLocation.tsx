import { PropertyTypes } from "@/libs/types/types";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslations } from "next-intl";

// Set your Mapbox access token
mapboxgl.accessToken =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  "pk.eyJ1IjoicmFzaGFkbnVzaGFkIiwiYSI6ImNseGo1c3E1dDBjeWgybHFlOWp2b3Bsb3UifQ.eG9yV25a_w9Jp-3weVnmPA";

const CommonLocation = ({ property }: { property?: PropertyTypes }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const t = useTranslations("endUser");

  // Check if property has valid locations
  const hasValidLocations = property?.property_locations?.some(
    (location) =>
      location.location_lat !== null &&
      location.location_lng !== null &&
      !isNaN(Number(location.location_lat)) &&
      !isNaN(Number(location.location_lng)) &&
      Number(location.location_lat) !== 0 &&
      Number(location.location_lng) !== 0
  );

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [5.2708, 5.2048], // Default center
      zoom: 12,
    });
  }, []);

  useEffect(() => {
    if (
      !map.current ||
      !property?.property_locations ||
      property?.property_locations.length === 0
    )
      return;

    try {
      const locations = property?.property_locations;

      console.log(property);

      // Filter out locations with invalid coordinates
      const validLocations = locations.filter(
        (location) =>
          location.location_lat !== null &&
          location.location_lng !== null &&
          !isNaN(Number(location.location_lat)) &&
          !isNaN(Number(location.location_lng)) &&
          Number(location.location_lat) !== 0 &&
          Number(location.location_lng) !== 0
      );

      // If no valid locations, return early
      if (validLocations.length === 0) {
        return;
      }

      // Add markers to map
      validLocations.forEach((location) => {
        const lng = Number(location.location_lng);
        const lat = Number(location.location_lat);

        // Double-check coordinates are valid before creating marker
        if (!isNaN(lng) && !isNaN(lat) && lng !== 0 && lat !== 0) {
          new mapboxgl.Marker({ color: "red" })
            .setLngLat([lng, lat])
            .addTo(map.current!);
        }
      });

      // Fit map to markers
      if (validLocations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        validLocations.forEach((location) => {
          const lng = Number(location.location_lng);
          const lat = Number(location.location_lat);

          // Double-check coordinates are valid before extending bounds
          if (!isNaN(lng) && !isNaN(lat) && lng !== 0 && lat !== 0) {
            bounds.extend([lng, lat]);
          }
        });

        // Only fit bounds if we have valid coordinates
        if (!bounds.isEmpty()) {
          map.current.fitBounds(bounds, { padding: 50 });
        }
      }
    } catch (error) {
      console.error("Error setting up map markers:", error);
    }
  }, [property]);

  // Return null if no valid locations (after hooks)
  if (!hasValidLocations) {
    return null;
  }

  return (
    <>
      <h4 className="mb-40">{t("Location")}</h4>
      <div className="bg-white shadow4 p-30">
        <div className="map-banner overflow-hidden">
          <div
            ref={mapContainer}
            className="gmap_canvas h-100 w-100"
            style={{ height: "450px" }}
          />
        </div>
      </div>
    </>
  );
};

export default CommonLocation;
