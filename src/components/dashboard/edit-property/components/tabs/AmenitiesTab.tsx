import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { PropertyData } from "../../PropertyTypes";
import { deleteData, postData, getData } from "@/libs/server/backendServer";
import { AxiosHeaders } from "axios";
import ModalForm from "../ModalForm";
// import { PropertyAmenity } from '@/types/PropertyTypes';
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

interface AmenitiesTabProps {
  token: string;
  property: PropertyData;
  onUpdate?: () => void; // Callback to refresh property data
  refetch?: () => void; // Callback to refresh property data
}

interface AvailableAmenity {
  id: number;
  title: string;
  descriptions: {
    en: {
      title: string;
    };
    ar: {
      title: string;
    };
  };
  image?: string;
}

export const AmenitiesTab: React.FC<AmenitiesTabProps> = ({
  property,
  onUpdate,
  refetch,
  token,
}) => {
  const params = useParams();
  const propertyId = params?.id as string;
  const locale = useLocale();
  const t = useTranslations("Amenities");

  // Access amenities from property.data.amenities
  console.log("====================================");
  console.log("amenitiesTab", property.data?.amenities);
  console.log("====================================");

  // Helper function to check if image URL is valid
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    const validExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".bmp",
      ".ico",
    ];
    const lowerUrl = url.toLowerCase();
    return (
      validExtensions.some((ext) => lowerUrl.includes(ext)) ||
      lowerUrl.startsWith("data:image/")
    );
  };

  // Default image placeholder
  const getDefaultImageComponent = () => (
    <div
      className="bg-light border d-flex align-items-center justify-content-center rounded"
      style={{ height: "24px", width: "24px" }}
    >
      <span className="small text-muted">🏠</span>
    </div>
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAmenitiesListModal, setShowAmenitiesListModal] = useState(false);
  const [selectedAmenityId, setSelectedAmenityId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [amenitiesListLoading, setAmenitiesListLoading] = useState(false);
  const [availableAmenities, setAvailableAmenities] = useState<
    AvailableAmenity[]
  >([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>([]);

  // Get currently selected amenity IDs from property - FIXED: Access from property.data.amenities
  const getCurrentlySelectedAmenityIds = (): number[] => {
    return property?.data?.amenities?.map((amenity) => amenity.id) || [];
  };

  const handleAddAmenitiesClick = async () => {
    setShowAmenitiesListModal(true);
    setAmenitiesListLoading(true);

    // Initialize with currently selected amenities
    const currentlySelected = getCurrentlySelectedAmenityIds();
    setSelectedAmenityIds(currentlySelected);

    try {
      const response = await getData(
        "agent/amenities",
        {},
        new AxiosHeaders({
          lang: locale,
          Authorization: `Bearer ${token}`,
        })
      );

      setAvailableAmenities(response?.data.data || []);
    } catch (error) {
      console.error("Failed to fetch amenities:", error);
    } finally {
      setAmenitiesListLoading(false);
    }
  };

  const handleAmenityCheckboxChange = (amenityId: number, checked: boolean) => {
    if (checked) {
      setSelectedAmenityIds((prev) => [...prev, amenityId]);
    } else {
      setSelectedAmenityIds((prev) => prev.filter((id) => id !== amenityId));
    }
  };

  const handleAddSelectedAmenities = async () => {
    const currentlySelected = getCurrentlySelectedAmenityIds();

    // Check if there are any changes
    const hasChanges =
      selectedAmenityIds.length !== currentlySelected.length ||
      !selectedAmenityIds.every((id) => currentlySelected.includes(id)) ||
      !currentlySelected.every((id) => selectedAmenityIds.includes(id));

    // If no changes, just close the modal
    if (!hasChanges) {
      setShowAmenitiesListModal(false);
      return;
    }

    if (selectedAmenityIds.length === 0) {
      // If user deselected all amenities, we might want to handle this case
      // For now, we'll just close the modal
      setShowAmenitiesListModal(false);
      return;
    }

    try {
      setLoading(true);

      // Send all selected amenity IDs (both existing and new ones)
      const formDataToSend = new FormData();
      formDataToSend.append("property_id", propertyId);

      // Add all selected amenity IDs
      selectedAmenityIds.forEach((amenityId, index) => {
        formDataToSend.append(`amenity_ids[${index}]`, amenityId.toString());
      });

      // If you need to update/replace amenities instead of just adding,
      // you might need a different endpoint or method
      await postData(
        `agent/properties/${propertyId}/amenities`,
        formDataToSend,
        new AxiosHeaders({
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        })
      );

      setShowAmenitiesListModal(false);
      setSelectedAmenityIds([]);

      // Refetch data to update the UI
      refetch?.();

      // Call the update callback to refresh the property data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to update amenities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (amenityId: string) => {
    setSelectedAmenityId(amenityId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAmenityId) return;

    try {
      setLoading(true);

      await deleteData(
        `owner/amenities/${selectedAmenityId}`,
        new AxiosHeaders({
          Authorization: `Bearer ${token}`,
        })
      );

      setShowDeleteModal(false);
      setSelectedAmenityId(null);

      // Refetch data to update the UI
      refetch?.();

      // Call the update callback to refresh the property data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to delete amenity:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderAmenitiesListModal = () => {
    const currentlySelected = getCurrentlySelectedAmenityIds();
    const hasChanges =
      selectedAmenityIds.length !== currentlySelected.length ||
      !selectedAmenityIds.every((id) => currentlySelected.includes(id)) ||
      !currentlySelected.every((id) => selectedAmenityIds.includes(id));

    return (
      <div>
        {amenitiesListLoading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "8rem" }}
          >
            <p className="fs-5">{t("Loading amenities")}</p>
          </div>
        ) : (
          <div>
            <div className="mb-3">
              <p className="small text-muted">
                {t("Select amenities for this property:")}
              </p>
            </div>

            <div
              style={{ maxHeight: "24rem", overflowY: "auto" }}
              className="d-flex flex-column gap-3"
            >
              {availableAmenities.map((amenity) => {
                const isSelected = selectedAmenityIds.includes(amenity.id);

                return (
                  <div
                    key={amenity.id}
                    className={`d-flex align-items-center gap-3 p-3 border rounded transition ${
                      isSelected
                        ? "border-primary bg-primary bg-opacity-10"
                        : "border-secondary-subtle"
                    }`}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor =
                          "var(--bs-gray-100)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "";
                      }
                    }}
                  >
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id={`amenity-${amenity.id}`}
                        checked={isSelected}
                        onChange={(e) =>
                          handleAmenityCheckboxChange(
                            amenity.id,
                            e.target.checked
                          )
                        }
                        className="form-check-input"
                      />
                    </div>

                    {/* Amenity Icon */}
                    <div className="flex-shrink-0">
                      {isValidImageUrl(amenity.image) ? (
                        <Image
                          width={24}
                          height={24}
                          src={amenity.image!}
                          alt={
                            locale === "ar"
                              ? amenity.descriptions.ar.title
                              : amenity.descriptions.en.title
                          }
                          style={{
                            height: "24px",
                            width: "24px",
                            objectFit: "contain",
                          }}
                          onError={(e) => {
                            // Replace with default on error
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML =
                                '<div class="bg-light border d-flex align-items-center justify-content-center rounded" style="height: 24px; width: 24px;"><span class="small text-muted">🏠</span></div>';
                            }
                          }}
                        />
                      ) : (
                        getDefaultImageComponent()
                      )}
                    </div>

                    <label
                      htmlFor={`amenity-${amenity.id}`}
                      className="flex-fill"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-medium text-body">
                          {locale === "ar"
                            ? amenity.descriptions.ar.title
                            : amenity.descriptions.en.title}
                        </span>
                      </div>
                      <div className="small text-muted">
                        {locale === "ar"
                          ? amenity.descriptions.en.title
                          : amenity.descriptions.ar.title}
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>

            {availableAmenities.length === 0 && (
              <div className="text-center text-muted py-5">
                {t("No amenities available")}
              </div>
            )}

            <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-3">
              <button
                type="button"
                onClick={() => {
                  setShowAmenitiesListModal(false);
                  setSelectedAmenityIds([]);
                }}
                className="btn btn-outline-secondary"
                disabled={loading}
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleAddSelectedAmenities}
                className={`btn ${
                  hasChanges ? "btn-primary" : "btn-secondary"
                }`}
                disabled={loading || !hasChanges}
              >
                {loading
                  ? t("Updating...")
                  : hasChanges
                  ? t(`Update Selection (${selectedAmenityIds.length})`)
                  : t("No Changes")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // FIXED: Access amenities from property.data.amenities
  const propertyAmenities = property?.data?.amenities || [];

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fs-5 fw-semibold text-body">{t("Amenities")}</h3>
        <button
          onClick={handleAddAmenitiesClick}
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
        >
          <Plus size={20} />
          {t("Manage Amenities")}
        </button>
      </div>

      {propertyAmenities.length > 0 ? (
        <div className="row g-3">
          {propertyAmenities.map((amenity) => (
            <div key={amenity.id} className="col-12 col-md-6 col-lg-4">
              <div className="card border-secondary-subtle bg-light">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3 flex-fill">
                      {isValidImageUrl(amenity.image) ? (
                        <Image
                          width={24}
                          height={24}
                          src={amenity.image!}
                          alt={
                            locale === "ar"
                              ? amenity.descriptions.ar.title
                              : amenity.descriptions.en.title
                          }
                          style={{
                            height: "24px",
                            width: "24px",
                            objectFit: "contain",
                          }}
                          onError={(e) => {
                            // Replace with default on error
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML =
                                '<div class="bg-light border d-flex align-items-center justify-content-center rounded" style="height: 24px; width: 24px;"><span class="small text-muted">🏠</span></div>';
                            }
                          }}
                        />
                      ) : (
                        getDefaultImageComponent()
                      )}
                      <div className="fw-medium text-body">
                        {locale === "ar"
                          ? amenity.descriptions.ar.title
                          : amenity.descriptions.en.title}
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        onClick={() =>
                          handleDeleteClick(amenity?.id?.toString())
                        }
                        className="btn btn-danger btn-sm"
                        title="Delete amenity"
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
          {t("No amenities listed for this property")}
        </div>
      )}

      {/* Manage Amenities Modal */}
      <ModalForm
        open={showAmenitiesListModal}
        title={t("Manage Property Amenities")}
        onClose={() => {
          setShowAmenitiesListModal(false);
          setSelectedAmenityIds([]);
        }}
      >
        {renderAmenitiesListModal()}
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
          {t(
            "Are you sure you want to delete this amenity? This action cannot be undone"
          )}
        </p>
        <div className="d-flex justify-content-end gap-2">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedAmenityId(null);
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
            {loading ? t("Deleting") : t("Delete")}
          </button>
        </div>
      </ModalForm>
    </div>
  );
};
