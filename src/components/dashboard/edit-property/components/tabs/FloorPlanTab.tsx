import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { PropertyData } from '../../PropertyTypes';
import { deleteData, postData } from '@/libs/server/backendServer';
import { AxiosHeaders } from 'axios';
import ModalForm from '../ModalForm';
import { useTranslations } from 'next-intl';

interface FloorPlanTabProps {
  token:string;
  property: PropertyData;
  onUpdate?: () => void; // Callback to refresh property data
}

interface FloorPlanFormData {
  property_listing_id: string;
  floor_plans: FileList | null;
}

export const FloorPlanTab: React.FC<FloorPlanTabProps> = ({ property, onUpdate,token }) => {
  const params = useParams();
  const propertyId = params?.id as string;
  const t = useTranslations("floorplan");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FloorPlanFormData>({
    property_listing_id: propertyId || '',
    floor_plans: null
  });

  const resetFormData = () => {
    setFormData({
      property_listing_id: propertyId || '',
      floor_plans: null
    });
  };

  const handleAddClick = () => {
    resetFormData();
    setShowAddModal(true);
  };

  const handleDeleteClick = (planId: string) => {
    setSelectedPlanIds([planId]);
    setShowDeleteModal(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedPlanIds.length === 0) return;
    setShowDeleteModal(true);
  };

  const handlePlanSelect = (planId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedPlanIds(prev => [...prev, planId]);
    } else {
      setSelectedPlanIds(prev => prev.filter(id => id !== planId));
    }
  };

  const handleSelectAll = () => {
    if (selectedPlanIds.length === property.data.property_floor_plans.length) {
      setSelectedPlanIds([]);
    } else {
      setSelectedPlanIds(property.data.property_floor_plans.map(plan => plan.id.toString()));
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedPlanIds.length === 0) return;
    
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      
      // Build query string for multiple IDs
      const queryParams = selectedPlanIds
        .map((id, index) => `ids[${index}]=${id}`)
        .join('&');
      
      await deleteData(`agent/property/floor-plan?${queryParams}`, new AxiosHeaders({
        Authorization: `Bearer ${token}`,
      }));
      
      setShowDeleteModal(false);
      setSelectedPlanIds([]);
      
      // Call the update callback to refresh the property data
      if (onUpdate) {
        onUpdate();
      }
    } catch {
      // console.error(t("Failed to delete floor plans"), error);
      // You might want to show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.floor_plans || formData.floor_plans.length === 0) {
      alert('Please select at least one floor plan');
      return;
    }
    
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append('property_listing_id', formData.property_listing_id);
      
      // Append multiple floor plans
      Array.from(formData.floor_plans).forEach((file, index) => {
        formDataToSend.append(`floor_plans[${index}]`, file);
      });
      
      await postData('agent/property/floor-plan', formDataToSend, new AxiosHeaders({
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
      console.error('Failed to add floor plans:', error);
      // You might want to show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      floor_plans: e.target.files
    }));
  };

  const renderFloorPlanForm = () => (
    <form onSubmit={handleAddSubmit}>
      <div className="mb-4">
        <label className="form-label fw-medium">
          {t("Select Floor Plans")}
        </label>
        <input
          type="file"
          accept="image/*,.pdf"
          multiple
          onChange={handleFileChange}
          className="form-control"
          required
        />
        {formData.floor_plans && formData.floor_plans.length > 0 && (
          <div className="form-text text-success mt-1">
            {formData.floor_plans.length} {t("floor plan(s) selected")}
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
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? t("Uploading...") : t("Upload Floor Plans")}
        </button>
      </div>
    </form>
  );

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 text-secondary">{t("Floor Plans")}</h3>
        <div className="d-flex align-items-center gap-2">
          {property.data.property_floor_plans.length > 0 && (
            <>
              <button
                onClick={handleSelectAll}
                className="btn btn-secondary btn-sm"
              >
                {selectedPlanIds.length === property.data.property_floor_plans.length ? t('Deselect All') : t('Select All')}
              </button>
              {selectedPlanIds.length > 0 && (
                <button
                  onClick={handleBulkDeleteClick}
                  className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                >
                  <Trash2 size={16} />
                  {/* {t("Delete Selected")} ({selectedPlanIds.length}) */}
                </button>
              )}
            </>
          )}
          <button
            onClick={handleAddClick}
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            <Plus size={20} />
            {t("Add New Floor Plans")}
          </button>
        </div>
      </div>

      {property.data.property_floor_plans.length > 0 ? (
        <div className="row g-4">
          {property.data.property_floor_plans.map((plan, index) => (
            <div key={plan.id} className="col-md-6">
              <div className="card bg-light border position-relative">
                {/* Selection Checkbox */}
                <div className="position-absolute top-0 start-0 m-2" style={{zIndex: 10}}>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedPlanIds.includes(plan.id.toString())}
                      onChange={(e) => handlePlanSelect(plan.id.toString(), e.target.checked)}
                    />
                  </div>
                </div>
                
                {/* Delete Button */}
                <div className="position-absolute top-0 end-0 m-2" style={{zIndex: 10}}>
                  <button
                    onClick={() => handleDeleteClick(plan.id.toString())}
                    className="btn btn-danger btn-sm"
                    title={t("Delete floor plan")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="card-body">
                  <h6 className="card-title fw-medium text-dark mb-3">
                    Floor Plan {index + 1}
                  </h6>
                  
                  <div className="position-relative rounded overflow-hidden mb-3" style={{aspectRatio: '4/5'}}>
                    <Image
                      src={plan.image}
                      alt={`Floor plan ${index + 1}`}
                      fill
                      className="object-fit-cover"
                    />
                  </div>
                  
                  <a
                    href={plan.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-primary text-decoration-none small"
                  >
                    {t("Download Floor Plan")}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted py-5">
          {t("No floor plans available for this property")}
        </div>
      )}

      {/* Add Floor Plans Modal */}
      <ModalForm
        open={showAddModal}
        title={t("Add New Floor Plans")} 
        onClose={() => {
          setShowAddModal(false);
          resetFormData();
        }}
      >
        {renderFloorPlanForm()}
      </ModalForm>

      {/* Delete Confirmation Modal */}
      <ModalForm
        open={showDeleteModal}
        title={t("confirm_delete")}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPlanIds([]);
        }}
      >
        <p className="text-muted mb-4">
          {t("Are you sure you want to delete")} {selectedPlanIds.length === 1 ? t("this floor plan") : `these ${selectedPlanIds.length} floor plans`}? {t("This action cannot be undone")}
        </p>
        <div className="d-flex justify-content-end gap-2">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedPlanIds([]);
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
            {loading ? 'Deleting...' : `Delete ${selectedPlanIds.length === 1 ? 'Floor Plan' : 'Floor Plans'}`}
          </button>
        </div>
      </ModalForm>
    </div>
  );
};