import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import { useParams } from 'next/navigation';
import { PropertyData, PropertyLocation, LocationPoint } from '../../PropertyTypes';
import { postData } from '@/libs/server/backendServer';
import { AxiosHeaders } from 'axios';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useTranslations } from 'next-intl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'your-mapbox-token-here';

interface LocationTabProps {
  token: string;
  property: PropertyData;
  onUpdate?: () => void;
}

interface LocationGroup {
  [key: string]: PropertyLocation[];
}

interface PolygonGeoJSONFeature {
  type: 'Feature';
  properties: {
    name: string;
    color: string;
    pointCount?: number;
    locations?: PropertyLocation[];
    id?: number;
    location_points?: LocationPoint[];
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][]; // Polygon coordinates (array of rings)
  };
}

interface PointGeoJSONFeature {
  type: 'Feature';
  properties: {
    name: string;
    color: string;
    pointCount?: number;
    locations?: PropertyLocation[];
    id?: number;
    location_points?: LocationPoint[];
  };
  geometry: {
    type: 'Point';
    coordinates: number[]; // Point coordinates
  };
}

interface DrawEvent {
  features: Array<{
    geometry: {
      type: string;
      coordinates: number[][][]; // For polygons
    };
  }>;
}

export const LocationTab: React.FC<LocationTabProps> = ({ property, onUpdate,token }) => {
  const params = useParams();
  const propertyId = params?.id as string;
  console.log('Property Locations:', property);
  const t = useTranslations('properties');

  // Extract property data - handle both nested and direct structure
  const propertyData = property?.data || property;
  const propertyLocations = propertyData?.property_locations || [];

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const existingMarkers = useRef<mapboxgl.Marker[]>([]);

  const [loading, setLoading] = useState(false);
  const [showOldLocations, setShowOldLocations] = useState(true);
  const [newSelectedPolygon, setNewSelectedPolygon] = useState<Array<{ lng: number; lat: number }>>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupName, setPopupName] = useState('');

  const loadExistingLocations = useCallback(() => {
    if (!map.current || !propertyLocations.length) return;

    // Clear existing markers and sources
    existingMarkers.current.forEach(marker => marker.remove());
    existingMarkers.current = [];

    // Remove existing sources and layers
    const existingSources = ['existing-areas', 'existing-points'];
    existingSources.forEach(sourceId => {
      if (map.current!.getSource(sourceId)) {
        const layersToRemove = [`${sourceId}-fill`, `${sourceId}-stroke`, `${sourceId}-labels`, `${sourceId}-points`];
        layersToRemove.forEach(layerId => {
          if (map.current!.getLayer(layerId)) {
            map.current!.removeLayer(layerId);
          }
        });
        map.current!.removeSource(sourceId);
      }
    });

    // Group locations by name with proper typing
    const locationGroups: LocationGroup = propertyLocations.reduce((groups: LocationGroup, location: PropertyLocation) => {
      if (!groups[location.name]) {
        groups[location.name] = [];
      }
      groups[location.name].push(location);
      return groups;
    }, {});

    // Create areas for each group
    const areaFeatures: PolygonGeoJSONFeature[] = [];
    const pointFeatures: PointGeoJSONFeature[] = [];
    const colors = ['#45B7D1', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    let colorIndex = 0;

    Object.entries(locationGroups).forEach(([name, locations]) => {
      const color = colors[colorIndex % colors.length];
      colorIndex++;

      if (locations.length >= 3) {
        // Create polygon for 3+ points
        const coordinates = locations.map(loc => [loc.longitude, loc.latitude]);

        // Close the polygon by adding the first point at the end
        coordinates.push(coordinates[0]);

        areaFeatures.push({
          type: 'Feature',
          properties: {
            name: name,
            color: color,
            pointCount: locations.length,
            locations: locations
          },
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates]
          }
        });
      } else {
        // Create points for 1-2 points
        locations.forEach(location => {
          pointFeatures.push({
            type: 'Feature',
            properties: {
              name: name,
              color: color,
              id: location.id,
              location_points: location.location_points
            },
            geometry: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            }
          });
        });
      }
    });

    // Add area source and layers
    if (areaFeatures.length > 0) {
      map.current!.addSource('existing-areas', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: areaFeatures
        }
      });

      // Add fill layer
      map.current!.addLayer({
        id: 'existing-areas-fill',
        type: 'fill',
        source: 'existing-areas',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.3
        }
      });

      // Add stroke layer
      map.current!.addLayer({
        id: 'existing-areas-stroke',
        type: 'line',
        source: 'existing-areas',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2,
          'line-opacity': 0.8
        }
      });

      // Add labels layer for area names
      map.current!.addLayer({
        id: 'existing-areas-labels',
        type: 'symbol',
        source: 'existing-areas',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 14,
          'text-anchor': 'center',
          'text-allow-overlap': false,
          'text-ignore-placement': false
        },
        paint: {
          'text-color': '#000000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
          'text-halo-blur': 1
        }
      });

      // Add click handler for areas
      map.current!.on('click', 'existing-areas-fill', (e: mapboxgl.MapMouseEvent) => {
        if (e.features && e.features[0] && e.features[0].properties) {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .addTo(map.current!);
        }
      });

      // Change cursor on hover
      map.current!.on('mouseenter', 'existing-areas-fill', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current!.on('mouseleave', 'existing-areas-fill', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    }

    // Add point source and layers for single/double points
    if (pointFeatures.length > 0) {
      map.current!.addSource('existing-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: pointFeatures
        }
      });

      map.current!.addLayer({
        id: 'existing-points-points',
        type: 'circle',
        source: 'existing-points',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 8,
          'circle-opacity': 0.8,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      });

      // Add labels for individual points
      map.current!.addLayer({
        id: 'existing-points-labels',
        type: 'symbol',
        source: 'existing-points',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-anchor': 'top',
          'text-offset': [0, 1.5],
          'text-allow-overlap': false,
          'text-ignore-placement': false
        },
        paint: {
          'text-color': '#000000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
          'text-halo-blur': 1
        }
      });

      // Add click handler for points
      map.current!.on('click', 'existing-points-points', (e: mapboxgl.MapMouseEvent) => {
        if (e.features && e.features[0] && e.features[0].properties) {
          const properties = e.features[0].properties;

          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div>
                <p><strong>Name:</strong> ${properties.name || 'N/A'}</p>
                <p><strong>ID:</strong> ${properties.id || 'N/A'}</p>
                ${properties.location_points && properties.location_points.length > 0 ?
                `<p><strong>Location Points:</strong> ${properties.location_points.length}</p>` : ''}
                <p><strong>Type:</strong> Point Location</p>
              </div>
            `)
            .addTo(map.current!);
        }
      });

      // Change cursor on hover
      map.current!.on('mouseenter', 'existing-points-points', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current!.on('mouseleave', 'existing-points-points', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
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
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [31.2357, 30.0444], // Default to Cairo, Egypt
      zoom: 12
    });

    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true
      },
      defaultMode: 'draw_polygon'
    });

    map.current.addControl(draw.current);

    map.current.on('load', () => {
      if (propertyLocations.length > 0) {
        loadExistingLocations();
      }
    });

    map.current.on('click', handleMapClick);

    // Listen for draw events
    map.current.on('draw.create', handleDrawCreate);
    map.current.on('draw.update', handleDrawUpdate);
    map.current.on('draw.delete', handleDrawDelete);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapContainer, propertyLocations, loadExistingLocations]);

  const toggleOldLocations = () => {
    setShowOldLocations(!showOldLocations);

    // Toggle visibility of area and point layers
    const layers = ['existing-areas-fill', 'existing-areas-stroke', 'existing-areas-labels', 'existing-points-points', 'existing-points-labels'];

    layers.forEach(layerId => {
      if (map.current && map.current.getLayer(layerId)) {
        map.current.setLayoutProperty(
          layerId,
          'visibility',
          showOldLocations ? 'none' : 'visible'
        );
      }
    });
  };

  const handleMapClick = () => {
  // Map click is now only used for polygon drawing via MapboxDraw
  // No manual point selection needed
  };

  const handleDrawCreate = (e: DrawEvent) => {
    // Handle polygon creation
    if (e.features && e.features[0] && e.features[0].geometry.type === 'Polygon') {
      const coordinates = e.features[0].geometry.coordinates[0];
      setNewSelectedPolygon(coordinates.map((coord: number[]) => ({ lng: coord[0], lat: coord[1] })));
      console.log('New polygon created:', coordinates);
    }
  };

  const handleDrawUpdate = (e: DrawEvent) => {
    // Handle polygon update
    if (e.features && e.features[0] && e.features[0].geometry.type === 'Polygon') {
      const coordinates = e.features[0].geometry.coordinates[0];
      setNewSelectedPolygon(coordinates.map((coord: number[]) => ({ lng: coord[0], lat: coord[1] })));
      console.log('Polygon updated:', coordinates);
    }
  };

  const handleDrawDelete = () => {
    // Handle polygon deletion
    setNewSelectedPolygon([]);
    console.log('Polygon deleted');
  };

  const getCurrentCoordinates = (): number[][] => {
    if (!draw.current) return [];

    // Check if there are drawn features (polygons)
    const data = draw.current.getAll();
    if (data.features.length > 0) {
      const feature = data.features[0];
      if (feature.geometry.type === 'Polygon') {
        return feature.geometry.coordinates[0] as number[][];
      }
    }

    return [];
  };

  const clearNewPolygon = () => {
    setNewSelectedPolygon([]);

    // Clear any drawn features
    if (draw.current) {
      draw.current.deleteAll();
    }
  };

  const handleLogCoordinates = async () => {
    // const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not authenticated');
      return;
    }

    const currentCoordinates = getCurrentCoordinates();

    if (currentCoordinates.length === 0) {
      alert('Please draw a polygon area first');
      return;
    }

    if (!popupName.trim()) {
      alert('Please enter a name for the coordinates');
      return;
    }

    console.log('Logging Coordinates:', {
      propertyId,
      name: popupName,
      coordinates: currentCoordinates,
      totalPoints: currentCoordinates.length
    });

    try {
      setLoading(true);

      await postData(
        `agent/locations`,
        {
          property_listing_id: propertyId,
          name: popupName.trim(),
          polygon: currentCoordinates
        },
        new AxiosHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        })
      );

      alert('Coordinates logged successfully!');

      // Call onUpdate function
      if (onUpdate) {
        onUpdate();
      }

    } catch (error) {
      console.error('Error logging coordinates:', error);
      alert('Failed to log coordinates');
    } finally {
      setLoading(false);
      setShowPopup(false);
      setPopupName('');
    }
  };

  const handlePopupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPopupName(e.target.value);
  };

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 fw-semibold text-muted">
          {t("Property Locations")}
        </h3>
        <div className="d-flex gap-2">
          <button
            onClick={toggleOldLocations}
            className={`btn fw-medium shadow-sm transition-all d-flex align-items-center gap-2 ${showOldLocations
              ? 'btn-primary'
              : 'btn-secondary'
              }`}
          >
            {showOldLocations ? <Eye size={20} /> : <EyeOff size={20} />}
            {showOldLocations ? t('Hide Old Locations') : t('Show Old Locations')}
          </button>

          {!showOldLocations && (
            <button
              onClick={clearNewPolygon}
              className="btn btn-danger fw-medium shadow-sm transition-all"
            >
              {t("Clear Polygon")}
            </button>
          )}

          <button
            onClick={() => setShowPopup(true)}
            className="btn btn-primary fw-medium shadow-sm transition-all d-flex align-items-center gap-2"
            disabled={getCurrentCoordinates().length === 0}
          >
            <MapPin size={20} />
            {t("create Area")} ({getCurrentCoordinates().length} {t("points")})
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-4 p-3 bg-light border border-primary border-opacity-25 rounded">
        <p className="small text-primary mb-0">
          <strong className="px-3">{t("Instructions")}       :</strong>
          {showOldLocations
            ? t('Click')
            : t('Use the')
          }
        </p>
      </div>

      <div className="mb-4">
        <div
          ref={mapContainer}
          className="rounded border border-secondary-subtle"
          style={{ height: '400px' }}
        />
      </div>

      {/* Show summary of selected polygon */}
      {newSelectedPolygon.length > 0 && (
        <div className="mb-4 p-3 bg-light border border-primary border-opacity-25 rounded">
          <p className="small text-primary mb-0">
            <strong>{t("New Polygon Area:")}</strong> {newSelectedPolygon.length} {t("points")}
          </p>
          <div className="mt-2" style={{ maxHeight: '8rem', overflowY: 'auto' }}>
            {newSelectedPolygon.map((point, index) => (
              <div key={index} className="small text-primary">
                {t("Point")} {index + 1}: {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popup to enter name and log coordinates */}
      {showPopup && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="bg-white p-4 rounded shadow" style={{ width: '33.333333%', maxWidth: '28rem' }}>
            <h3 className="h5 fw-semibold mb-3">{t("Enter Name for Area")}</h3>
            <p className="small text-muted mb-3">
              {t("Enter Name for Area")} {getCurrentCoordinates().length} {t("coordinate points")}
            </p>
            <input
              type="text"
              value={popupName}
              onChange={handlePopupNameChange}
              className="form-control mb-3"
              placeholder="Enter area name"
              autoFocus
            />
            <div className="d-flex justify-content-end gap-3">
              <button
                onClick={() => {
                  setShowPopup(false);
                  setPopupName('');
                }}
                className="btn btn-outline-secondary transition-all"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleLogCoordinates}
                className="btn btn-success transition-all"
                disabled={loading || !popupName.trim()}
              >
                {loading ? t('loading') : t('create Area')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};