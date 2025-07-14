import React, { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { PropertyData } from '../../PropertyTypes';
import { deleteData, postData } from '@/libs/server/backendServer';
import { AxiosHeaders } from 'axios';
import ModalForm from '../ModalForm';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, Edit } from 'lucide-react';

interface ImagesTabProps {
  token: string;
  property: PropertyData;
  refetch?: () => void; // Callback to refresh property data
}

interface ImageFormData {
  property_listing_id: string;
  images: FileList | null;
}

export const ImagesTab: React.FC<ImagesTabProps> = ({ property, refetch, token }) => {
  const params = useParams();
  const propertyId = params?.id as string;
  const t = useTranslations("Images");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ImageFormData>({
    property_listing_id: propertyId || '',
    images: null
  });

  const resetFormData = () => {
    setFormData({
      property_listing_id: propertyId || '',
      images: null
    });
  };

  const handleAddClick = () => {
    resetFormData();
    setShowAddModal(true);
  };

  const handleDeleteClick = (imageId: string) => {
    setSelectedImageIds([imageId]);
    setShowDeleteModal(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedImageIds.length === 0) return;
    setShowDeleteModal(true);
  };

  const handleImageSelect = (imageId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedImageIds(prev => [...prev, imageId]);
    } else {
      setSelectedImageIds(prev => prev.filter(id => id !== imageId));
    }
  };

  const handleSelectAll = () => {
    if (selectedImageIds.length === property.data.property_listing_images.length) {
      setSelectedImageIds([]);
    } else {
      setSelectedImageIds(property.data.property_listing_images.map(img => img.id.toString()));
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedImageIds.length === 0) return;
    
    try {
      setLoading(true);
      
      // Build query string for multiple IDs
      const queryParams = selectedImageIds
        .map((id, index) => `ids[${index}]=${id}`)
        .join('&');
      
      await deleteData(`agent/property/images?${queryParams}`, new AxiosHeaders({
        Authorization: `Bearer ${token}`,
      }));
      
      setShowDeleteModal(false);
      setSelectedImageIds([]);
      
      // Call refetch to refresh the property data after successful deletion
      if (refetch) {
        refetch();
      }
    } catch (error) {
      console.error('Failed to delete images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.images || formData.images.length === 0) {
      alert('Please select at least one image');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append('property_listing_id', formData.property_listing_id);
      
      // Append multiple images
      Array.from(formData.images).forEach((file, index) => {
        formDataToSend.append(`images[${index}]`, file);
      });
      
      await postData('agent/property/images', formDataToSend, new AxiosHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }));
      
      setShowAddModal(false);
      resetFormData();
      
      // Call refetch to refresh the property data after successful creation
      if (refetch) {
        refetch();
      }
    } catch (error) {
      console.error('Failed to add images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      images: e.target.files
    }));
  };

  const renderImageForm = () => (
    <form onSubmit={handleAddSubmit}>
      <div className="mb-4">
        <label className="form-label fw-medium">
          {t("Select Images")}
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="form-control"
          required
        />
        {formData.images && formData.images.length > 0 && (
          <div className="form-text text-success">
            {formData.images.length} {t("image(s) selected")}
          </div>
        )}
      </div>
      
      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          onClick={() => {
            setShowAddModal(false);
            resetFormData();
          }}
          className="btn btn-outline-secondary"
          disabled={loading}
        >
          {t("Cancel")}
        </button>
        <button
          type="submit"
          className="btn dash-btn-two"
          disabled={loading}
        >
          {loading ? t("Uploading...") : t("Upload Images")}
        </button>
      </div>
    </form>
  );

  return (
    <div className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 fw-semibold text-body">{t("Property Images")}</h3>
        <div className="d-flex align-items-center gap-2">
          {property?.data.property_listing_images?.length > 0 && (
            <>
              <button
                onClick={handleSelectAll}
                className="btn btn-secondary btn-sm shadow-sm"
              >
                {selectedImageIds.length === property?.data.property_listing_images?.length ? t('Deselect All') : t('Select All')}
              </button>
              {selectedImageIds.length > 0 && (
                <button
                  onClick={handleBulkDeleteClick}
                  className="btn btn-danger btn-sm shadow-sm d-flex align-items-center gap-2"
                >
                  {/* <img src="/assets/images/dashboard/icon/icon_29.svg" alt="Delete" width="16" height="16" /> */}
                  <Trash2 size={16}/>
                  {t("Delete Selected")} ({selectedImageIds?.length})
                </button>
              )}
            </>
          )}
          <button
            onClick={handleAddClick}
            className="btn dash-btn-two shadow-sm d-flex align-items-center gap-2"
          >
            {/* <img src="/assets/images/dashboard/icon/icon_29.svg" alt="Add" width="16" height="16" /> */}
            <Plus size={16}/>
            {t("Add New Images")}
          </button>
        </div>
      </div>

      {property?.data.property_listing_images?.length > 0 ? (
        <div className="row g-4">
          {property?.data.property_listing_images?.map((image, index) => (
            <div key={image.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 position-relative">
                {/* Selection Checkbox */}
                <div className="position-absolute top-0 start-0 p-2" style={{zIndex: 10}}>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedImageIds.includes(image?.id?.toString())}
                      onChange={(e) => handleImageSelect(image?.id?.toString(), e.target.checked)}
                    />
                  </div>
                </div>
                
                {/* Delete Button */}
                <div className="position-absolute top-0 end-0 p-2" style={{zIndex: 10}}>
                  <button
                    onClick={() => handleDeleteClick(image?.id?.toString())}
                    className="btn btn-danger btn-sm shadow-sm"
                    title="Delete image"
                  >
                    <img src="/assets/images/dashboard/icon/icon_29.svg" alt="Delete" width="16" height="16" />
                  </button>
                </div>

                <div className="card-body p-3">
                  <div className="ratio ratio-16x9 mb-2 rounded overflow-hidden">
                    <Image
                      src={image?.image}
                      alt={`Property image ${index + 1}`}
                      fill
                      className="object-fit-cover"
                    />
                  </div>
                  <a
                    href={image?.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-link btn-sm p-0 text-decoration-none"
                  >
                    View Full Size
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted py-5">
          <p className="mb-0">{t("No images available for this property")}</p>
        </div>
      )}

      {/* Add Images Modal */}
      <ModalForm
        open={showAddModal}
        title={t("Add New Images")}
        onClose={() => {
          setShowAddModal(false);
          resetFormData();
        }}
      >
        {renderImageForm()}
      </ModalForm>

      {/* Delete Confirmation Modal */}
      <ModalForm
        open={showDeleteModal}
        title={t("Confirm Delete")}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedImageIds([]);
        }}
      >
        <p className="text-muted mb-4">
          {t("Are you sure you want to delete images? This action cannot be undone.")}
        </p>
        <div className="d-flex justify-content-end gap-2">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedImageIds([]);
            }}
            className="btn btn-outline-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="btn btn-danger"
            disabled={loading}
          >
            {loading ? 'Deleting...' : `Delete ${selectedImageIds?.length === 1 ? 'Image' : 'Images'}`}
          </button>
        </div>
      </ModalForm>
    </div>
  );
};