import { PropertyTypes } from "@/libs/types/types";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslations } from "next-intl";

// Set your Mapbox access token
mapboxgl.accessToken =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  "pk.eyJ1IjoicmFzaGFkbnVzaGFkIiwiYSI6ImNseGo1c3E1dDBjeWgybHFlOWp2b3Bsb3UifQ.eG9yV25a_w9Jp-3weVnmPA";

const buildGoogleMapsEmbedUrl = (
  rawUrl?: string,
  fallbackQuery?: string
): string | null => {
  if (!rawUrl) {
    if (!fallbackQuery) return null;
    return `https://www.google.com/maps?q=${encodeURIComponent(
      fallbackQuery
    )}&output=embed`;
  }

  try {
    const parsed = new URL(rawUrl);

    if (
      parsed.hostname.includes("google.") &&
      parsed.pathname.startsWith("/maps/embed")
    ) {
      return parsed.toString();
    }

    if (
      parsed.hostname.includes("google.") &&
      parsed.pathname.startsWith("/maps")
    ) {
      parsed.searchParams.set("output", "embed");
      return parsed.toString();
    }
  } catch (error) {
    // noop – fall back below
  }

  if (rawUrl.includes("output=embed")) {
    return rawUrl;
  }

  if (rawUrl.includes("maps.app.goo.gl") || rawUrl.includes("goo.gl/maps")) {
    if (!fallbackQuery) return null;
    return `https://www.google.com/maps?q=${encodeURIComponent(
      fallbackQuery
    )}&output=embed`;
  }

  return `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}output=embed`;
};

const buildGoogleMapsDirectUrl = (
  rawUrl?: string,
  fallbackQuery?: string
): string | null => {
  if (rawUrl) return rawUrl;
  if (!fallbackQuery) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(fallbackQuery)}`;
};

const CommonLocation = ({ property }: { property?: PropertyTypes }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const t = useTranslations("endUser");

  const googleMapsUrl = property?.area?.google_maps?.trim();
  const fallbackQuery = property?.area?.name || property?.title;
  const googleMapsEmbedUrl = googleMapsUrl
    ? buildGoogleMapsEmbedUrl(googleMapsUrl, fallbackQuery)
    : null;
  const googleMapsDirectUrl = buildGoogleMapsDirectUrl(
    googleMapsUrl,
    fallbackQuery
  );

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
    if (googleMapsEmbedUrl) return;
    if (map.current || !mapContainer.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [5.2708, 5.2048], // Default center
      zoom: 12,
    });
  }, [googleMapsEmbedUrl]);

  useEffect(() => {
    if (googleMapsEmbedUrl) return;
    if (
      !map.current ||
      !property?.property_locations ||
      property?.property_locations.length === 0
    )
      return;

    try {
      const locations = property?.property_locations;

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
  }, [property, googleMapsEmbedUrl]);

  // Return null if no valid locations (after hooks)
  if (!googleMapsEmbedUrl && !hasValidLocations) {
    return null;
  }

  return (
    <>
      <h4 className="mb-40">{t("Location")}</h4>
      <div className="bg-white shadow4 p-30">
        <div className="map-banner overflow-hidden">
          {googleMapsEmbedUrl ? (
            <>
              <iframe
                src={googleMapsEmbedUrl}
                className="h-100 w-100"
                style={{ height: "450px", border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={property?.area?.name || t("Location")}
              />
              {googleMapsDirectUrl && (
                <div className="d-flex justify-content-end mt-20">
                  <a
                    href={googleMapsDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-three"
                  >
                    {t("view_on_google_maps")}
                  </a>
                </div>
              )}
            </>
          ) : (
            <div
              ref={mapContainer}
              className="gmap_canvas h-100 w-100"
              style={{ height: "450px" }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CommonLocation;
