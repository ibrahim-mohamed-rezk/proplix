import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { deleteData, postData } from '@/libs/server/backendServer';
import { AxiosHeaders } from 'axios';
import ModalForm from '../ModalForm';
import { PropertyAmenity, PropertyData } from '../../PropertyTypes';
import { useTranslations } from 'next-intl';

interface AmenitiesTabProps {
  property: PropertyData;
  token: string; // Add token to the props interface
  onUpdate?: () => void; // Callback to refresh property data
}

interface AmenityFormData {
  property_listing_id: string;
  'title[en]': string;
  'title[ar]': string;
}

// Fix the function signature - token should be part of props, not a separate parameter
export const AmenitiesTab: React.FC<AmenitiesTabProps> = ({ property, token, onUpdate }) => {
  const params = useParams();
  const propertyId = params?.id as string;
  const t = useTranslations("Amenities");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAmenityId, setSelectedAmenityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AmenityFormData>({
    property_listing_id: propertyId || '',
    'title[en]': '',
    'title[ar]': ''
  });

  const resetFormData = () => {
    setFormData({
      property_listing_id: propertyId || '',
      'title[en]': '',
      'title[ar]': ''
    });
  };

  const handleAddClick = () => {
    resetFormData();
    setShowAddModal(true);
  };

  const handleEditClick = (amenity: PropertyAmenity) => {
    setFormData({
      property_listing_id: propertyId || '',
      'title[en]': amenity?.descriptions?.en?.title,
      'title[ar]': amenity?.descriptions?.ar?.title
    });
    setSelectedAmenityId(amenity?.id?.toString());
    setShowEditModal(true);
  };

  const handleDeleteClick = (amenityId: string) => {
    setSelectedAmenityId(amenityId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAmenityId) return;
    
    try {
      setLoading(true);
      
      await deleteData(`owner/amenities/${selectedAmenityId}`, new AxiosHeaders({
        Authorization: `Bearer ${token}`, // Use token from props
      }));
      
      setShowDeleteModal(false);
      setSelectedAmenityId(null);
      
      // Call the update callback to refresh the property data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to delete amenity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append('property_listing_id', formData.property_listing_id);
      formDataToSend.append('title[en]', formData['title[en]']);
      formDataToSend.append('title[ar]', formData['title[ar]']);
      
      await postData('owner/amenities', formDataToSend, new AxiosHeaders({
        Authorization: `Bearer ${token}`, // Use token from props
        'Content-Type': 'multipart/form-data',
      }));
      
      setShowAddModal(false);
      resetFormData();
      
      // Call the update callback to refresh the property data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to add amenity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAmenityId) return;
    
    try {
      setLoading(true);
      
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append('property_listing_id', formData.property_listing_id);
      formDataToSend.append('title[en]', formData['title[en]']);
      formDataToSend.append('title[ar]', formData['title[ar]']);
      formDataToSend.append('_method', 'PUT'); // Laravel method spoofing for FormData
      
      await postData(`owner/amenities/${selectedAmenityId}`, formDataToSend, new AxiosHeaders({
        Authorization: `Bearer ${token}`, // Use token from props
        'Content-Type': 'multipart/form-data',
      }));
      
      setShowEditModal(false);
      setSelectedAmenityId(null);
      resetFormData();
      
      // Call the update callback to refresh the property data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update amenity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AmenityFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderAmenityForm = (isEdit: boolean = false) => (
    <form onSubmit={isEdit ? handleEditSubmit : handleAddSubmit}>
      <div className="mb-4">
        <label className="form-label">
          {t("title(EN)")} 
        </label>
        <input
          type="text"
          value={formData['title[en]']}
          onChange={(e) => handleInputChange('title[en]', e.target.value)}
          className="form-control"
          placeholder={t("e.g., Swimming Pool, Gym")}
          required
        />
      </div>
      <div className="mb-6">
        <label className="form-label">
          {t("title(AR)")} 
        </label>
        <input
          type="text"
          value={formData['title[ar]']}
          onChange={(e) => handleInputChange('title[ar]', e.target.value)}
          className="form-control"
          placeholder={t("e.g., Swimming Pool, Gym")}
          required
        />
      </div>
      <div className="d-flex justify-content-end">
        <button
          type="button"
          onClick={() => {
            if (isEdit) {
              setShowEditModal(false);
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
          {loading ? (isEdit ? t("Updating") : t("Adding")) : (isEdit ? t("Update Amenity") : t("Add Amenity"))}
        </button>
      </div>
    </form>
  );

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="h5">{t("Amenities")}</h3>
        <button
          onClick={handleAddClick}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <img src="/assets/images/dashboard/icon/icon_29.svg" alt="Add" width="20" />
          {t("Add New Amenity")}
        </button>
      </div>

      {property?.data?.amenities?.length > 0 ? (
        <div className="row">
          {property?.data?.amenities?.map((amenity) => (
            <div key={amenity.id} className="col-12 col-md-6 col-lg-4 mb-4">
              <div className="card">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">{amenity?.title}</div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleEditClick(amenity)}
                      className="btn btn-success"
                      title="Edit amenity"
                    >
                      <img src="/assets/images/dashboard/icon/icon_24.svg" alt="Edit" width="16" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(amenity?.id?.toString())}
                      className="btn btn-danger"
                      title="Delete amenity"
                    >
                      <img src="/assets/images/dashboard/icon/icon_29.svg" alt="Delete" width="16" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted py-4">
          {t("No amenities listed for this property")}
        </div>
      )}

      {/* Add Amenity Modal */}
      <ModalForm
        open={showAddModal}
        title={t("Add New Amenity")}
        onClose={() => {
          setShowAddModal(false);
          resetFormData();
        }}
      >
        {renderAmenityForm(false)}
      </ModalForm>

      {/* Edit Amenity Modal */}
      <ModalForm
        open={showEditModal}
        title={t("Edit Amenity")}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAmenityId(null);
          resetFormData();
        }}
      >
        {renderAmenityForm(true)}
      </ModalForm>

      {/* Delete Confirmation Modal */}
      <ModalForm
        open={showDeleteModal}
        title={t("Confirm Delete")}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAmenityId(null);
        }}
      >
        <p className="text-muted mb-4">
          {t("Are you sure you want to delete this amenity? This action cannot be undone")}
        </p>
        <div className="d-flex justify-content-end gap-2">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedAmenityId(null);
            }}
            className="btn btn-secondary"
            disabled={loading}
          >
            {t("Cancel")}
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="btn btn-danger"
            disabled={loading}
          >
            {loading ? t("Deleting") : t("Delete")}
          </button>
        </div>
      </ModalForm>
    </div>
  );
};