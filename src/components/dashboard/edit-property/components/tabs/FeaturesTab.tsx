import React, { useState } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useParams } from 'next/navigation';
import { PropertyData } from '../../PropertyTypes';
import { deleteData, postData } from '@/libs/server/backendServer';
import { AxiosHeaders } from 'axios';
import ModalForm from '../ModalForm';
import { useTranslations } from 'next-intl';
// import { PropertyFeature } from '@/types/PropertyTypes';

interface PropertyFeature {
  id: number;
  type: string;
  key: string;
  value: string;
  description: {
    en: {
      title: string | null;
      description: string | null;
      keywords: string | null;
      slug: string | null;
      meta_title: string | null;
      meta_description: string | null;
      meta_keywords: string | null;
    };
    ar: {
      title: string | null;
      description: string | null;
      keywords: string | null;
      slug: string | null;
      meta_title: string | null;
      meta_description: string | null;
      meta_keywords: string | null;
    };
  };
}

interface FeaturesTabProps {
  token:string;
  property: PropertyData;
  onUpdate?: () => void; // Callback to refresh property data
}

interface FeatureFormData {
  property_listing_id: string;
  
  type: string;
  'key[en]': string;
  'key[ar]': string;
  'value[en]': string;
  'value[ar]': string;
}

const FEATURE_TYPES = [
  { value: 'property_feature', label: 'Property Feature' },
  { value: 'utility_detail', label: 'Utility Detail' },
  { value: 'outdoor_feature', label: 'Outdoor Feature' },
  { value: 'indoor_feature', label: 'Indoor Feature' }
];

export const FeaturesTab: React.FC<FeaturesTabProps> = ({ property, onUpdate,token }) => {
  const params = useParams();
  const propertyId = params?.id as string;
  const  t  = useTranslations("features");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FeatureFormData>({
    property_listing_id: propertyId || '',
    type: 'property_feature',
    'key[en]': '',
    'key[ar]': '',
    'value[en]': '',
    'value[ar]': ''
  });

  const resetFormData = () => {
    setFormData({
      property_listing_id: propertyId || '',
     
      type: 'property_feature',
      'key[en]': '',
      'key[ar]': '',
      'value[en]': '',
      'value[ar]': ''
    });
  };

  const handleAddClick = () => {
    resetFormData();
    setShowAddModal(true);
  };

  const handleEditClick = (feature: PropertyFeature) => {
    setFormData({
      property_listing_id: propertyId || '',
      
      type: feature?.type || 'property_feature',
      'key[en]': feature?.key || '',
      'key[ar]': feature?.key || '', // Assuming key is the same for both languages based on JSON structure
      'value[en]': feature?.value || '',
      'value[ar]': feature.value || '' // Assuming value is the same for both languages based on JSON structure
    });
    setSelectedFeatureId(feature.id.toString());
    setShowEditModal(true);
  };

  const handleDeleteClick = (featureId: string) => {
    setSelectedFeatureId(featureId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFeatureId) return;
    
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      
      await deleteData(`agnet/features/${selectedFeatureId}`, new AxiosHeaders({
        Authorization: `Bearer ${token}`,
      }));
      
      setShowDeleteModal(false);
      setSelectedFeatureId(null);
      
      // Call the update callback to refresh the property data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to delete feature:', error);
      // You might want to show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      
      // Create FormData object
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      await postData('agnet/features', formDataToSend, new AxiosHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }));
      
      setShowAddModal(false);
      resetFormData();
      
      // Call the update callback to refresh the property data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to add feature:', error);
      // You might want to show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFeatureId) return;
    
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      
      // Create FormData object
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      formDataToSend.append('_method', 'PUT'); // Laravel method spoofing for FormData
      
      await postData(`agent/features/${selectedFeatureId}`, formDataToSend, new AxiosHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }));
      
      setShowEditModal(false);
      setSelectedFeatureId(null);
      resetFormData();
      
      // Call the update callback to refresh the property data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update feature:', error);
      // You might want to show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FeatureFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderFeatureForm = (isEdit: boolean = false) => (
    <form onSubmit={isEdit ? handleEditSubmit : handleAddSubmit}>
      <div className="row">
        <div className="col-12">
          <div className="mb-3">
            <label className="form-label fw-medium">
              {t("Feature Type")}
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="form-select"
              required
            >
              {FEATURE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {t(type.label)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label fw-medium">
              {t("Key (English)")}
            </label>
            <input
              type="text"
              value={formData['key[en]']}
              onChange={(e) => handleInputChange('key[en]', e.target.value)}
              className="form-control"
              required
            />
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label fw-medium">
              {t("Key (Arabic)")}
            </label>
            <input
              type="text"
              value={formData['key[ar]']}
              onChange={(e) => handleInputChange('key[ar]', e.target.value)}
              className="form-control"
              required
            />
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label fw-medium">
              {t("Value (English)")}
            </label>
            <input
              type="text"
              value={formData['value[en]']}
              onChange={(e) => handleInputChange('value[en]', e.target.value)}
              className="form-control"
              required
            />
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label fw-medium">
              {t("Value (Arabic)")}
            </label>
            <input
              type="text"
              value={formData['value[ar]']}
              onChange={(e) => handleInputChange('value[ar]', e.target.value)}
              className="form-control"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="d-flex justify-content-end gap-2 mt-4">
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
          {loading ? (isEdit ? t('Updating') : t('Adding')) : (isEdit ? t('Update Feature') : t('Add Feature'))}
        </button>
      </div>
    </form>
  );

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 text-secondary">{t("Property Features")}</h3>
        <button
          onClick={handleAddClick}
          className="btn dash-btn-two d-flex align-items-center gap-2"
        >
          <Plus size={20} />
          {t("Add New Feature")}
        </button>
      </div>

      {property?.data.features?.length > 0 ? (
        <div className="row">
          {property?.data.features?.map((feature) => (
            <div key={feature.id} className="col-md-6 mb-3">
              <div className="card bg-light border">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                      <div className="bg-primary rounded-circle" style={{width: '8px', height: '8px'}}></div>
                      <div>
                        <span className="fw-medium text-dark">
                          {feature?.key}:
                        </span>
                        <span className="text-muted ms-2">
                          {feature?.value}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => handleEditClick(feature as unknown as PropertyFeature)}
                        className="btn btn-success btn-sm"
                        title="Edit feature"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(feature?.id?.toString())}
                        className="btn btn-danger btn-sm"
                        title="Delete feature"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted py-5">
          {t("No features listed for this property")}
        </div>
      )}

      {/* Add Feature Modal */}
      <ModalForm
        open={showAddModal}
        title={t("Add New Feature")}
        onClose={() => {
          setShowAddModal(false);
          resetFormData();
        }}
      >
        {renderFeatureForm(false)}
      </ModalForm>

      {/* Edit Feature Modal */}
      <ModalForm
        open={showEditModal}
        title={t("Edit Feature")}
        onClose={() => {
          setShowEditModal(false);
          setSelectedFeatureId(null);
          resetFormData();
        }}
      >
        {renderFeatureForm(true)}
      </ModalForm>

      {/* Delete Confirmation Modal */}
      <ModalForm
        open={showDeleteModal}
        title={t("Confirm Delete")}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedFeatureId(null);
        }}
      >
        <p className="text-muted mb-4">
          {t("Are you sure you want to delete this feature? This action cannot be undone")}
        </p>
        <div className="d-flex justify-content-end gap-2">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedFeatureId(null);
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
            {loading ? t('Deleting') : t('Delete')}
          </button>
        </div>
      </ModalForm>
    </div>
  );
};