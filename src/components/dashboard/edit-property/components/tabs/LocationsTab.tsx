import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PropertyData } from '../../PropertyTypes';
import { deleteData, postData } from '@/libs/server/backendServer';
import { AxiosHeaders } from 'axios';
import ModalForm from '../ModalForm';
import { useTranslations } from 'next-intl';
import Toast from '@/components/Toast';

// Mapbox GL JS imports
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'your-mapbox-token-here';

interface LocationTabProps {
  token: string;
  property: PropertyData;
  onUpdate?: () => void;
}

interface LocationPoint {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  location_points?: { latitude: number; longitude: number }[]; // Optional polygon points
}

type ToastState = {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
};

interface LocationFormData {
  property_listing_id: string;
  name: string;
  latitude: number;
  longitude: number;
  polygon_points: number;
  polygon_radius: number;
}

interface TempLocationPoint {
  id: string;
  latitude: number;
  longitude: number;
  polygon_points: number;
  polygon_radius: number;
  marker: mapboxgl.Marker;
}

export const LocationTab: React.FC<LocationTabProps> = ({ property, onUpdate, token }) => {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;
  const t = useTranslations("Location");
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [editingLocation, setEditingLocation] = useState<LocationPoint | null>(null);
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    show: false,
  });
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Multi-point addition states
  const [isMultiAddMode, setIsMultiAddMode] = useState(false);
  const [tempLocations, setTempLocations] = useState<TempLocationPoint[]>([]);
  const [showMultiAddModal, setShowMultiAddModal] = useState(false);
  const [multiName, setMultiName] = useState(''); // single name for all points

  const [formData, setFormData] = useState<LocationFormData>({
    property_listing_id: propertyId || '',
    name: '',
    latitude: 0,
    longitude: 0,
    polygon_points: 1,
    polygon_radius: 0.0001
  });

  // Generate polygon points around a center coordinate
  const generatePolygonPoints = (centerLat: number, centerLng: number, numPoints: number, radius: number): number[][] => {
    const points: number[][] = [];

    if (numPoints === 1) {
      points.push([centerLng, centerLat]);
      return points;
    }

    const angleStep = (2 * Math.PI) / numPoints;

    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep;
      const lat = centerLat + radius * Math.cos(angle);
      const lng = centerLng + radius * Math.sin(angle);
      points.push([lng, lat]);
    }

    return points;
  };

  // Convert locations to FormData format for multi-point submission
  const createMultiPointFormData = (locations: TempLocationPoint[]): FormData => {
    const formData = new FormData();

    formData.append('property_listing_id', propertyId);
    formData.append('name', multiName.trim() || 'Bulk Location Upload');

    locations.forEach((location, index) => {
      const polygonPoints = generatePolygonPoints(
        location.latitude,
        location.longitude,
        location.polygon_points,
        location.polygon_radius
      );

      polygonPoints.forEach((point, pointIndex) => {
        const locationPolygonIndex = index * polygonPoints.length + pointIndex;
        formData.append(`polygon[${locationPolygonIndex}][0]`, point[0].toString());
        formData.append(`polygon[${locationPolygonIndex}][1]`, point[1].toString());
      });
    });

    return formData;
  };

  // Convert single location to FormData format
  const createSingleLocationFormData = (locationData: {
    property_listing_id: string;
    name: string;
    latitude: number;
    longitude: number;
    polygon: number[][];
  }): FormData => {
    const formData = new FormData();

    formData.append('property_listing_id', locationData.property_listing_id);
    formData.append('name', locationData.name);
    formData.append('latitude', locationData.latitude.toString());
    formData.append('longitude', locationData.longitude.toString());

    locationData.polygon.forEach((point, index) => {
      formData.append(`polygon[${index}][0]`, point[0].toString());
      formData.append(`polygon[${index}][1]`, point[1].toString());
    });

    return formData;
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [31.2357, 30.0444], // Default to Cairo, Egypt
      zoom: 10
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('click', (e) => {
      if (showAddModal || showEditModal) return;

      const { lng, lat } = e.lngLat;

      if (isMultiAddMode) {
        handleMultiPointClick(lng, lat);
      } else {
        handleSinglePointClick(lng, lat);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isMultiAddMode]);

  // Load existing locations and add markers
  useEffect(() => {
    if (property?.data?.property_locations) {
      // Convert PropertyLocation[] to LocationPoint[]
      const convertedLocations: LocationPoint[] = property.data?.property_locations.map(loc => ({
        id: loc.id,
        name: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        location_points: loc.location_points
      }));
      setLocations(convertedLocations);
      addMarkersToMap(convertedLocations);
    }
  }, [property]);

  const addMarkersToMap = (locationPoints: LocationPoint[]) => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    locationPoints.forEach((location) => {
      const marker = new mapboxgl.Marker({ color: '#3B82F6' })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <h3>${location.name}</h3>
            <p>Lat: ${location.latitude.toFixed(6)}<br>Lng: ${location.longitude.toFixed(6)}</p>
            ${location.location_points ? `<p>Polygon Points: ${location.location_points.length}</p>` : ''}
          `)
        )
        .addTo(map.current!);

      markers.current.push(marker);
    });

    if (locationPoints.length > 0 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      locationPoints.forEach(location => {
        bounds.extend([location.longitude, location.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  };

  const handleSinglePointClick = (lng: number, lat: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
    setShowAddModal(true);
  };

  const handleMultiPointClick = (lng: number, lat: number) => {
    const tempId = `temp_${Date.now()}_${Math.random()}`;

    const marker = new mapboxgl.Marker({ color: '#EF4444', draggable: true })
      .setLngLat([lng, lat])
      .addTo(map.current!);

    const tempLocation: TempLocationPoint = {
      id: tempId,
      latitude: lat,
      longitude: lng,
      polygon_points: 1,
      polygon_radius: 0.0001,
      marker: marker
    };

    marker.on('drag', () => {
      const lngLat = marker.getLngLat();
      setTempLocations(prev =>
        prev.map(loc =>
          loc.id === tempId
            ? { ...loc, latitude: lngLat.lat, longitude: lngLat.lng }
            : loc
        )
      );
    });

    setTempLocations(prev => [...prev, tempLocation]);
  };

  const resetFormData = () => {
    setFormData({
      property_listing_id: propertyId || '',
      name: '',
      latitude: 0,
      longitude: 0,
      polygon_points: 1,
      polygon_radius: 0.0001
    });
  };

  const resetMultiAddMode = () => {
    tempLocations.forEach(tempLoc => tempLoc.marker.remove());
    setTempLocations([]);
    setMultiName('');
    setIsMultiAddMode(false);
    setShowMultiAddModal(false);
  };

  const handleAddSingleClick = () => {
    resetFormData();
    setIsMultiAddMode(false);
    showToast(t("Click on the map to select a location"), "info");
  };

  const handleAddMultipleClick = () => {
    resetMultiAddMode();
    setIsMultiAddMode(true);
    showToast(t("Multi-add"), "info");
  };

  const handleSaveAllPoints = () => {
    if (tempLocations.length === 0) {
      showToast(t("No points added yet. Click on the map to add points."), "info");
      return;
    }
    setShowMultiAddModal(true);
  };

  const handleCancelMultiAdd = () => {
    resetMultiAddMode();
  };

  const handleEditClick = (location: LocationPoint) => {
    setEditingLocation(location);
    setFormData({
      property_listing_id: propertyId || '',
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      polygon_points: location.location_points ? location.location_points.length : 1,
      polygon_radius: 0.0001
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (locationId: string) => {
    setSelectedLocationIds([locationId]);
    setShowDeleteModal(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedLocationIds.length === 0) return;
    setShowDeleteModal(true);
  };

  const handleSelectAll = () => {
    if (selectedLocationIds.length === locations.length) {
      setSelectedLocationIds([]);
    } else {
      setSelectedLocationIds(locations.map(loc => loc.id.toString()));
    }
  };

  const removeTempLocation = (tempId: string) => {
    setTempLocations(prev => {
      const locToRemove = prev.find(loc => loc.id === tempId);
      if (locToRemove) locToRemove.marker.remove();
      return prev.filter(loc => loc.id !== tempId);
    });
  };

  const handleDeleteConfirm = async () => {
    if (selectedLocationIds.length === 0) return;

    try {
      setLoading(true);
      const queryParams = selectedLocationIds.join('&');

      await deleteData(`owner/locations/${queryParams}`, new AxiosHeaders({
        Authorization: `Bearer ${token}`,
      }));

      setShowDeleteModal(false);
      setSelectedLocationIds([]);
      router.refresh();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to delete locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast(t("Please enter a location name"), "error");
      return;
    }

    try {
      setLoading(true);

      const polygonPoints = generatePolygonPoints(
        formData.latitude,
        formData.longitude,
        formData.polygon_points,
        formData.polygon_radius
      );

      const locationData = {
        property_listing_id: formData.property_listing_id,
        name: formData.name,
        latitude: formData.latitude,
        longitude: formData.longitude,
        polygon: polygonPoints
      };

      const formDataToSend = createSingleLocationFormData(locationData);

      await postData('owner/locations', formDataToSend, new AxiosHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }));

      setShowAddModal(false);
      resetFormData();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to add location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation || !formData.name.trim()) return;

    try {
      setLoading(true);

      const polygonPoints = generatePolygonPoints(
        formData.latitude,
        formData.longitude,
        formData.polygon_points,
        formData.polygon_radius
      );

      const requestBody = {
        _method: 'PUT',
        property_listing_id: formData.property_listing_id,
        name: formData.name,
        latitude: formData.latitude,
        longitude: formData.longitude,
        polygon: polygonPoints
          .map((point, idx) => ({ [`${idx}`]: { 0: point[0], 1: point[1] } }))
          .reduce((acc, curr) => ({ ...acc, ...curr }), {})
      };

      await postData(
        `owner/locations/${editingLocation.id}`,
        requestBody,
        new AxiosHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        })
      );

      setShowEditModal(false);
      setEditingLocation(null);
      resetFormData();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMultiAddSubmit = async () => {
    if (!multiName.trim()) {
      showToast(t("Please enter a name for all locations."), "error");
      return;
    }
    if (tempLocations.length === 0) return;

    try {
      setLoading(true);
      const formDataToSend = createMultiPointFormData(tempLocations);

      await postData('owner/locations', formDataToSend, new AxiosHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }));

      resetMultiAddMode();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to add locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' || name === 'polygon_radius'
        ? parseFloat(value) || 0
        : name === 'polygon_points'
        ? parseInt(value) || 1
        : value
    }));
  };

  const renderLocationForm = (isEdit = false) => (
    <form onSubmit={isEdit ? handleEditSubmit : handleAddSubmit} className="mb-3">

      {/* Location Name Section */}
      <div className="mb-3">
        <h5 className="font-medium text-muted">{t("Location Information")}</h5>
        <label htmlFor="location-name" className="form-label">{t("Location Name")} *</label>
        <input
          id="location-name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="form-control"
          required
          placeholder={t("Enter location name")}
        />
      </div>

      {/* Coordinates Section */}
      <div className="mb-3">
        <h5 className="font-medium text-muted">{t("Coordinates")}</h5>
        <div className="row">
          <div className="col-6">
            <label htmlFor="latitude" className="form-label">{t("Latitude")} *</label>
            <input
              id="latitude"
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              step="any"
              className="form-control"
              required
            />
          </div>
          <div className="col-6">
            <label htmlFor="longitude" className="form-label">{t("Longitude")} *</label>
            <input
              id="longitude"
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              step="any"
              className="form-control"
              required
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-end">
        <button
          type="button"
          onClick={() => {
            if (isEdit) {
              setShowEditModal(false);
              setEditingLocation(null);
            } else {
              setShowAddModal(false);
            }
            resetFormData();
          }}
          className="btn btn-secondary me-2"
          disabled={loading}
        >
          {t("Cancel")}
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">{t("Saving...")}</span>
              </div>
              {t("Saving...")}
            </>
          ) : (
            <>
              <img src="/assets/images/dashboard/icon/icon_29.svg" alt="Add" width="20" />
              {isEdit ? t("Update Location") : t("Add Location")}
            </>
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="mb-4">
      {toast.show && <Toast message={toast.message} type={toast.type} duration={3000} />}
      <div className="d-flex justify-content-between mb-3">
        <h3 className="h5">{t("Property Locations")}</h3>
        <div className="d-flex gap-2">
          {locations.length > 0 && (
            <>
              <button
                onClick={handleSelectAll}
                className="btn btn-outline-secondary"
              >
                {selectedLocationIds.length === locations.length ? t('Deselect All') : t('Select All')}
              </button>
              {selectedLocationIds.length > 0 && (
                <button
                  onClick={handleBulkDeleteClick}
                  className="btn btn-outline-danger"
                >
                  {t("Delete Selected")} ({selectedLocationIds.length})
                </button>
              )}
            </>
          )}
          <button
            onClick={handleAddSingleClick}
            className="btn btn-outline-primary"
          >
            <img src="/assets/images/dashboard/icon/icon_29.svg" alt="Add" width="20" />
            {t("Add Single")}
          </button>
          <button
            onClick={handleAddMultipleClick}
            className="btn btn-outline-success"
          >
            <img src="/assets/images/dashboard/icon/icon_29.svg" alt="Add" width="20" />
            {t("Add Multiple")}
          </button>
        </div>
      </div>

      {/* Multi-add mode controls */}
      {isMultiAddMode && (
        <div className="alert alert-warning">
          <div className="d-flex justify-content-between">
            <div>
              <h5 className="alert-heading">{t("Multi-Add Mode Active")}</h5>
              <p>{t("Points added")}: {tempLocations.length}</p>
            </div>
            <div className="d-flex gap-2">
              <button
                onClick={handleSaveAllPoints}
                className="btn btn-success"
                disabled={tempLocations.length === 0}
              >
                <img src="/assets/images/dashboard/icon/icon_29.svg" alt="Add" width="20" />
                {t("Save All Points")}
              </button>
              <button
                onClick={handleCancelMultiAdd}
                className="btn btn-danger"
              >
                <img src="/assets/images/dashboard/icon/icon_29.svg" alt="Add" width="20" />
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="mb-4">
        <div
          ref={mapContainer}
          className="w-100 h-400 border"
        />
        <p className="text-muted mt-2">
          {isMultiAddMode
            ? t("Multi-add mode: Click on the map to add multiple location points")
            : t("Click on the map to add a new location point")
          }
        </p>
      </div>

      {/* Temporary locations list (when in multi-add mode) */}
      {isMultiAddMode && tempLocations.length > 0 && (
        <div className="mb-4">
          <h5>{t("Points to be added")}:</h5>
          <div className="list-group">
            {tempLocations.map((tempLoc, index) => (
              <div key={tempLoc.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span className="badge badge-secondary">{index + 1}</span>
                <span className="text-muted">
                  {tempLoc.latitude.toFixed(6)}, {tempLoc.longitude.toFixed(6)}
                </span>
                <button
                  onClick={() => removeTempLocation(tempLoc.id)}
                  className="btn btn-sm btn-danger"
                >
                  <img src="/assets/images/dashboard/icon/icon_29.svg" alt="Add" width="20" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locations List */}
      {property.data?.property_locations.length > 0 ? (
        <div className="list-group">
          {property.data?.property_locations.map((location) => (
            <div key={location.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <input
                  type="checkbox"
                  checked={selectedLocationIds.includes(location.id.toString())}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLocationIds(prev => [...prev, location.id.toString()]);
                    } else {
                      setSelectedLocationIds(prev => prev.filter(id => id !== location.id.toString()));
                    }
                  }}
                  className="form-check-input"
                />
                <div className="d-flex align-items-center ms-2">
                  <div className="badge bg-primary text-white rounded-circle">
                    <img src="/assets/images/dashboard/icon/icon_29.svg" alt="Add" width="20" />
                  </div>
                  <div>
                    <strong>{location.name}</strong>
                    <div className="text-muted">{location.latitude}, {location.longitude}</div>
                    {location.location_points && location.location_points.length > 0 && (
                      <div className="text-muted">
                        Polygon points: {location.location_points.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  onClick={() => handleEditClick(location)}
                  className="btn btn-outline-success btn-sm"
                  title="Edit location"
                >
                  <img src="/assets/images/dashboard/icon/icon_29.svg" alt="Edit" width="20" />
                </button>
                <button
                  onClick={() => handleDeleteClick(location.id.toString())}
                  className="btn btn-outline-danger btn-sm"
                  title="Delete location"
                >
                  <img src="/assets/images/dashboard/icon/icon_29.svg" alt="Delete" width="20" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted py-4">
          <img src="/assets/images/dashboard/icon/icon_29.svg" alt="Add" width="20" />
          <p>{t("No locations marked yet")}</p>
          <p>{t("Click on the map above or use the \"Add New Location\" button to mark your first location.")}</p>
        </div>
      )}

      {/* Add Single Location Modal */}
      <ModalForm
        open={showAddModal}
        title={t("Add New Location")}
        onClose={() => {
          setShowAddModal(false);
          resetFormData();
        }}
      >
        {renderLocationForm(false)}
      </ModalForm>

      {/* Multi-Add Modal */}
      <ModalForm
        open={showMultiAddModal}
        title={t("Save Multiple Locations")}
        onClose={() => {
          setShowMultiAddModal(false);
        }}
      >
        <div className="mb-3">
          <p className="text-muted mb-3">
            {t("You are about to save")} {tempLocations.length} {t("location(s).")}
          </p>
          <div className="max-height-60 overflow-auto">
            {tempLocations.map((tempLoc, index) => (
              <div key={tempLoc.id} className="d-flex justify-content-between align-items-center py-2">
                <span className="badge bg-secondary">{index + 1}</span>
                <span className="text-muted">
                  {tempLoc.latitude.toFixed(4)}, {tempLoc.longitude.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button
            onClick={() => setShowMultiAddModal(false)}
            className="btn btn-outline-secondary"
            disabled={loading}
          >
            {t("Cancel")}
          </button>
          <button
            onClick={handleMultiAddSubmit}
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? t("Saving...") : t("Save All Locations")}
          </button>
        </div>
      </ModalForm>

      {/* Edit Location Modal */}
      <ModalForm
        open={showEditModal}
        title={t("Edit Location")}
        onClose={() => {
          setShowEditModal(false);
          setEditingLocation(null);
          resetFormData();
        }}
      >
        {renderLocationForm(true)}
      </ModalForm>

      {/* Delete Confirmation Modal */}
      <ModalForm
        open={showDeleteModal}
        title={t("Confirm Delete")}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedLocationIds([]);
        }}
      >
        <p className="text-muted mb-3">
          {t("Are you sure you want to delete")} {selectedLocationIds.length === 1 ? t('this location') : `${t('these')} ${selectedLocationIds.length} ${t('locations')}`}? {t("This action cannot be undone.")}
        </p>
        <div className="d-flex justify-content-end gap-2">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedLocationIds([]);
            }}
            className="btn btn-outline-secondary"
            disabled={loading}
          >
            {t("Cancel")}
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="btn btn-danger"
            disabled={loading}
          >
            {loading ? t('Deleting...') : `${t('Delete')} ${selectedLocationIds.length === 1 ? t('Location') : t('Locations')}`}
          </button>
        </div>
      </ModalForm>
    </div>
  );
};
