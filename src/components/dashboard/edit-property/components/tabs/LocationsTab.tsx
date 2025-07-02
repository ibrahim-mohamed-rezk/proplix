import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Eye, EyeOff, Send } from "lucide-react";
import { useParams } from "next/navigation";
import {
  PropertyData,
  PropertyLocation,
  LocationPoint,
} from "../../PropertyTypes";
import { postData } from "@/libs/server/backendServer";
import { AxiosHeaders } from "axios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslations } from "next-intl";
import GoogleLocationInput from "@/components/common/GoogleLocationInput";

mapboxgl.accessToken =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "your-mapbox-token-here";

interface LocationTabProps {
  token: string;
  property: PropertyData;
  onUpdate?: () => void;
}

interface LocationGroup {
  [key: string]: PropertyLocation[];
}

interface PolygonGeoJSONFeature {
  type: "Feature";
  properties: {
    name: string;
    color: string;
    pointCount?: number;
    locations?: PropertyLocation[];
    id?: number;
    location_points?: LocationPoint[];
  };
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

interface LocationData {
  description: string;
  placeId: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface PointGeoJSONFeature {
  type: "Feature";
  properties: {
    name: string;
    color: string;
    pointCount?: number;
    locations?: PropertyLocation[];
    id?: number;
    location_points?: LocationPoint[];
  };
  geometry: {
    type: "Point";
    coordinates: number[];
  };
}

function getInitialSelectedLocation(): LocationData | null {
  return null;
}

function getInitialLocationValue(): string {
  return "";
}

export const LocationTab: React.FC<LocationTabProps> = ({
  property,
  onUpdate,
  token,
}) => {
  const params = useParams();
  const propertyId = params?.id as string;
  console.log("Property Locations:", property);
  const t = useTranslations("properties");

  // Extract property data - handle both nested and direct structure
  const propertyData = property?.data || property;
  const propertyLocations = propertyData?.property_locations || [];

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const existingMarkers = useRef<mapboxgl.Marker[]>([]);
  const selectedLocationMarker = useRef<mapboxgl.Marker | null>(null);

  const [loading, setLoading] = useState(false);
  const [showOldLocations, setShowOldLocations] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    getInitialSelectedLocation()
  );
  const [locationValue, setLocationValue] = useState<string>(
    getInitialLocationValue()
  );

  const loadExistingLocations = useCallback(() => {
    if (!map.current || !propertyLocations.length) return;

    // Clear existing markers and sources
    existingMarkers.current.forEach((marker) => marker.remove());
    existingMarkers.current = [];

    // Remove existing sources and layers
    const existingSources = ["existing-areas", "existing-points"];
    existingSources.forEach((sourceId) => {
      if (map.current!.getSource(sourceId)) {
        const layersToRemove = [
          `${sourceId}-fill`,
          `${sourceId}-stroke`,
          `${sourceId}-labels`,
          `${sourceId}-points`,
        ];
        layersToRemove.forEach((layerId) => {
          if (map.current!.getLayer(layerId)) {
            map.current!.removeLayer(layerId);
          }
        });
        map.current!.removeSource(sourceId);
      }
    });

    // Group locations by name with proper typing
    const locationGroups: LocationGroup = propertyLocations.reduce(
      (groups: LocationGroup, location: PropertyLocation) => {
        if (!groups[location.name]) {
          groups[location.name] = [];
        }
        groups[location.name].push(location);
        return groups;
      },
      {}
    );

    // Create areas for each group
    const areaFeatures: PolygonGeoJSONFeature[] = [];
    const pointFeatures: PointGeoJSONFeature[] = [];
    const colors = [
      "#45B7D1",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
    ];
    let colorIndex = 0;

    Object.entries(locationGroups).forEach(([name, locations]) => {
      const color = colors[colorIndex % colors.length];
      colorIndex++;

      if (locations.length >= 3) {
        // Create polygon for 3+ points
        const coordinates = locations.map((loc) => [
          loc.longitude,
          loc.latitude,
        ]);
        coordinates.push(coordinates[0]);

        areaFeatures.push({
          type: "Feature",
          properties: {
            name: name,
            color: color,
            pointCount: locations.length,
            locations: locations,
          },
          geometry: {
            type: "Polygon",
            coordinates: [coordinates],
          },
        });
      } else {
        // Create points for 1-2 points
        locations.forEach((location) => {
          pointFeatures.push({
            type: "Feature",
            properties: {
              name: name,
              color: color,
              id: location.id,
              location_points: location.location_points,
            },
            geometry: {
              type: "Point",
              coordinates: [location.longitude, location.latitude],
            },
          });
        });
      }
    });

    // Add area source and layers
    if (areaFeatures.length > 0) {
      map.current!.addSource("existing-areas", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: areaFeatures,
        },
      });

      // Add fill layer
      map.current!.addLayer({
        id: "existing-areas-fill",
        type: "fill",
        source: "existing-areas",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.3,
        },
      });

      // Add stroke layer
      map.current!.addLayer({
        id: "existing-areas-stroke",
        type: "line",
        source: "existing-areas",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2,
          "line-opacity": 0.8,
        },
      });

      // Add labels layer for area names
      map.current!.addLayer({
        id: "existing-areas-labels",
        type: "symbol",
        source: "existing-areas",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 14,
          "text-anchor": "center",
          "text-allow-overlap": false,
          "text-ignore-placement": false,
        },
        paint: {
          "text-color": "#000000",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
          "text-halo-blur": 1,
        },
      });

      // Add click handler for areas
      map.current!.on(
        "click",
        "existing-areas-fill",
        (e: mapboxgl.MapMouseEvent) => {
          if (e.features && e.features[0] && e.features[0].properties) {
            new mapboxgl.Popup().setLngLat(e.lngLat).addTo(map.current!);
          }
        }
      );

      // Change cursor on hover
      map.current!.on("mouseenter", "existing-areas-fill", () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = "pointer";
        }
      });

      map.current!.on("mouseleave", "existing-areas-fill", () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = "";
        }
      });
    }

    // Add point source and layers for single/double points
    if (pointFeatures.length > 0) {
      map.current!.addSource("existing-points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: pointFeatures,
        },
      });

      map.current!.addLayer({
        id: "existing-points-points",
        type: "circle",
        source: "existing-points",
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": 8,
          "circle-opacity": 0.8,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      // Add labels for individual points
      map.current!.addLayer({
        id: "existing-points-labels",
        type: "symbol",
        source: "existing-points",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 12,
          "text-anchor": "top",
          "text-offset": [0, 1.5],
          "text-allow-overlap": false,
          "text-ignore-placement": false,
        },
        paint: {
          "text-color": "#000000",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
          "text-halo-blur": 1,
        },
      });

      // Add click handler for points
      map.current!.on(
        "click",
        "existing-points-points",
        (e: mapboxgl.MapMouseEvent) => {
          if (e.features && e.features[0] && e.features[0].properties) {
            const properties = e.features[0].properties;

            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(
                `
              <div>
                <p><strong>Name:</strong> ${properties.name || "N/A"}</p>
                <p><strong>ID:</strong> ${properties.id || "N/A"}</p>
                ${
                  properties.location_points &&
                  properties.location_points.length > 0
                    ? `<p><strong>Location Points:</strong> ${properties.location_points.length}</p>`
                    : ""
                }
                <p><strong>Type:</strong> Point Location</p>
              </div>
            `
              )
              .addTo(map.current!);
          }
        }
      );

      // Change cursor on hover
      map.current!.on("mouseenter", "existing-points-points", () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = "pointer";
        }
      });

      map.current!.on("mouseleave", "existing-points-points", () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = "";
        }
      });
    }

    // Fit bounds to all locations
    if (propertyLocations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      propertyLocations.forEach((location: PropertyLocation) => {
        bounds.extend([location.longitude, location.latitude]);
      });
      map.current!.fitBounds(bounds, { padding: 50 });
    }
  }, [propertyLocations]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [31.2357, 30.0444], // Default to Cairo, Egypt
      zoom: 12,
      interactive: true, // Keep map interactive for viewing but no drawing
    });

    map.current.on("load", () => {
      if (propertyLocations.length > 0) {
        loadExistingLocations();
      }
    });

    // Center map on selected location when it changes
    if (selectedLocation && selectedLocation.coordinates && map.current) {
      map.current.setCenter([
        selectedLocation.coordinates.lng,
        selectedLocation.coordinates.lat,
      ]);
      map.current.setZoom(15);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      // Clean up selected location marker
      if (selectedLocationMarker.current) {
        selectedLocationMarker.current.remove();
        selectedLocationMarker.current = null;
      }
    };
  }, [
    mapContainer,
    propertyLocations,
    loadExistingLocations,
    selectedLocation,
  ]);

  const toggleOldLocations = () => {
    setShowOldLocations(!showOldLocations);

    // Toggle visibility of area and point layers
    const layers = [
      "existing-areas-fill",
      "existing-areas-stroke",
      "existing-areas-labels",
      "existing-points-points",
      "existing-points-labels",
    ];

    layers.forEach((layerId) => {
      if (map.current && map.current.getLayer(layerId)) {
        map.current.setLayoutProperty(
          layerId,
          "visibility",
          showOldLocations ? "none" : "visible"
        );
      }
    });
  };

  const handleLocationChange = (locationData: LocationData) => {
    console.log("Location selected:", locationData);
    setSelectedLocation(locationData);

    // Remove previous selected location marker
    if (selectedLocationMarker.current) {
      selectedLocationMarker.current.remove();
      selectedLocationMarker.current = null;
    }

    // Center map on selected location and add marker
    if (locationData.coordinates && map.current) {
      map.current.setCenter([
        locationData.coordinates.lng,
        locationData.coordinates.lat,
      ]);
      map.current.setZoom(15);

      // Create a custom marker element with map pointer design
      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";
      markerElement.style.cssText = `
        width: 40px;
        height: 50px;
        cursor: pointer !important;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
        z-index: 1000;
        position: relative;
        filter: drop-shadow(0 2px 10px rgba(0,0,0,0.3));
      `;

      // Create the map pin pointer shape
      markerElement.innerHTML = `
        <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
          <!-- Pin body -->
          <path d="M20 0C9 0 0 9 0 20C0 35 20 50 20 50S40 35 40 20C40 9 31 0 20 0Z" 
                fill="#dc3545" stroke="#fff" stroke-width="2"/>
          <!-- Inner circle -->
          <circle cx="20" cy="20" r="8" fill="#fff"/>
          <!-- Pin icon -->
          <text x="20" y="26" text-anchor="middle" font-size="12" fill="#dc3545">📍</text>
        </svg>
      `;

      // Add hover effects
      markerElement.addEventListener("mouseenter", () => {
        markerElement.style.transform = "scale(1.1)";
        markerElement.style.filter = "drop-shadow(0 4px 15px rgba(0,0,0,0.4))";
      });

      markerElement.addEventListener("mouseleave", () => {
        markerElement.style.transform = "scale(1)";
        markerElement.style.filter = "drop-shadow(0 2px 10px rgba(0,0,0,0.3))";
      });

      // Add the marker for the selected location
      selectedLocationMarker.current = new mapboxgl.Marker(markerElement)
        .setLngLat([locationData.coordinates.lng, locationData.coordinates.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="padding: 10px;">
                <h6 style="margin: 0 0 8px 0; color: #dc3545; font-weight: bold;">Selected Location</h6>
                <p style="margin: 0 0 4px 0;"><strong>Name:</strong> ${
                  locationData.description
                }</p>
                <p style="margin: 0 0 4px 0;"><strong>Coordinates:</strong> ${locationData.coordinates.lat.toFixed(
                  6
                )}, ${locationData.coordinates.lng.toFixed(6)}</p>
                <p style="margin: 0;"><strong>Place ID:</strong> ${
                  locationData.placeId
                }</p>
              </div>
            `)
        )
        .addTo(map.current);
    }
  };

  const handleSendLocation = async () => {
    if (!token) {
      alert("You are not authenticated");
      return;
    }

    if (!selectedLocation || !selectedLocation.coordinates) {
      alert("Please select a location from the Google suggestions first");
      return;
    }

    console.log("Sending Location:", {
      propertyId,
      description: selectedLocation.description,
      placeId: selectedLocation.placeId,
      coordinates: selectedLocation.coordinates,
    });

    try {
      setLoading(true);

      await postData(
        `agent/locations`,
        {
          property_listing_id: propertyId,
          name: selectedLocation.description,
          latitude: selectedLocation.coordinates.lat,
          longitude: selectedLocation.coordinates.lng,
          place_id: selectedLocation.placeId,
        },
        new AxiosHeaders({
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        })
      );

      alert("Location sent successfully!");

      // Clear the selection
      setSelectedLocation(null);
      setLocationValue("");

      // Remove selected location marker
      if (selectedLocationMarker.current) {
        selectedLocationMarker.current.remove();
        selectedLocationMarker.current = null;
      }

      // Call onUpdate function
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error sending location:", error);
      alert("Failed to send location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      {/* <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 fw-semibold text-muted">{t("Property Locations")}</h3>
        <div className="d-flex gap-2">
          <button
            onClick={toggleOldLocations}
            className={`btn fw-medium shadow-sm transition-all d-flex align-items-center gap-2 ${
              showOldLocations ? "btn-primary" : "btn-secondary"
            }`}
          >
            {showOldLocations ? <Eye size={20} /> : <EyeOff size={20} />}
            {showOldLocations
              ? t("Hide Old Locations")
              : t("Show Old Locations")}
          </button>
        </div>
      </div> */}

      {/* Google Location Search Section */}
      <div className="mb-4 p-3 bg-light border border-primary border-opacity-25 rounded">
        <h4 className="h6 fw-semibold mb-3 text-primary">
          {t("Search and Select Location")}
        </h4>

        <div className="mb-3">
          <GoogleLocationInput
            onLocationChange={handleLocationChange}
            defaultValue=""
            placeholder={t("Search for a location...")}
            disabled={loading}
          />
        </div>


        {/* Send Location Button */}
        <button
          onClick={handleSendLocation}
          className="btn btn-success fw-medium shadow-sm transition-all d-flex align-items-center gap-2"
          disabled={
            loading || !selectedLocation || !selectedLocation.coordinates
          }
        >
          <Send size={20} />
          {loading ? t("Sending...") : t("Send Location")}
        </button>
      </div>

      {/* Instructions */}
      <div className="mb-4 p-3 bg-light border border-info border-opacity-25 rounded">
        <p className="small text-info mb-0">
          <strong>{t("Instructions")}:</strong>{" "}
          {t(
            "Use the search box above to find and select a location from Google's suggestions, then click 'Send Location' to add it to the property."
          )}
        </p>
      </div>

      {/* Map Display */}
      <div className="mb-4">
        <div
          ref={mapContainer}
          className="rounded border border-secondary-subtle"
          style={{ height: "400px" }}
        />
      </div>
    </div>
  );
};
