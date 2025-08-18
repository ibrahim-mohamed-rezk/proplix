"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  PropertyData,
  PropertyStatistics,
  PropertyType,
  PropertyArea,
  FormInputs,
  LocationData,
  ImagePreview,
} from "../../PropertyTypes";
import { ReadOnlyField } from "../TabButton";
import { useTranslations } from "next-intl";
import {
  Edit2,
  Save,
  X,
  Check,
  ChevronDown,
  DollarSign,
  Home,
  FileText,
  Globe,
  Camera,
  CreditCard,
  Coins,
} from "lucide-react";
import defaultAvatar from "@/assets/images/loader.gif";
import GoogleLocationInput from "@/components/common/GoogleLocationInput";
import { useForm, useWatch } from "react-hook-form";
import { postData, getData } from "@/libs/server/backendServer";
import { AxiosHeaders } from "axios";
import { useLocale } from "next-intl";
import { toast } from "react-toastify";
import RichTextEditor from "@/components/RichTextEditor";

interface MainTabProps {
  token: string;
  property: PropertyData;
  propertystat?: PropertyStatistics;
}

export const MainTab: React.FC<MainTabProps> = ({
  property,
  token,
  propertystat,
}) => {
  const t = useTranslations("properties");
  const locale = useLocale();
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
  } = useForm<FormInputs>();

  const [descriptionEn, setDescriptionEn] = useState<string>("");
  const [descriptionAr, setDescriptionAr] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<ImagePreview | null>(null);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    pricing: true,
    rooms: true,
    details: true,
    arabic: true,
    english: true,
    images: true,
  });

  const paymentMethod = useWatch({ control, name: "payment_method" }) || "cash";

  // State for dropdown options
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [areas, setAreas] = useState<PropertyArea[]>([]);
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    if (type === "success") {
      toast.success(message);
    } else if (type === "error") {
      toast.error(message);
    } else {
      toast.info(message);
    }
  };

  // Initialize form with existing property data
  useEffect(() => {
    if (property?.data && isEditing) {
      const data = property.data;

      // Set basic fields
      setValue("type_id", data.type?.id?.toString() || "");
      setValue("area_id", data.area?.id?.toString() || "");
      setValue("price", data.price?.toString() || "");
      setValue("down_price", data.down_price?.toString() || "");
      setValue("sqt", data.sqt?.toString() || "");
      setValue("bedroom", data.bedroom?.toString() || "");
      setValue("bathroom", data.bathroom?.toString() || "");
      setValue("kitchen", data.kitichen?.toString() || "");
      setValue("status", data.status || "");
      setValue("immediate_delivery", data.immediate_delivery || "");
      setValue("payment_method", data.payment_method || "cash");
      setValue("paid_months", data.paid_months?.toString() || "");
      setValue("furnishing", data.furnishing || "");
      setValue("mortgage", data.mortgage || "no");

      // Set English fields
      setValue("title_en", data.descriptions?.en?.title || "");
      setValue("keywords_en", data.descriptions?.en?.keywords || "");
      setValue("slug_en", data.descriptions?.en?.slug || "");
      setDescriptionEn(data.descriptions?.en?.description || "");

      // Set Arabic fields
      setValue("title_ar", data.descriptions?.ar?.title || "");
      setValue("keywords_ar", data.descriptions?.ar?.keywords || "");
      setValue("slug_ar", data.descriptions?.ar?.slug || "");
      setDescriptionAr(data.descriptions?.ar?.description || "");

      // Set existing cover image - Note: PropertyData doesn't have a cover field in your types
      // You might need to add it or use the first image from property_listing_images
      if (
        data.property_listing_images &&
        data.property_listing_images.length > 0
      ) {
        setImagePreview({
          url: data.property_listing_images[0].image,
          id: "existing-cover",
          isExisting: true,
        });
      }

      // Set location data
      if (data.property_locations && data.property_locations.length > 0) {
        const location = data.property_locations[0];
        setLocationData({
          description: location.location,
          placeId: location.location_place_id,
          coordinates: {
            lat: location.location_lat,
            lng: location.location_lng,
          },
        });
      }
    }
  }, [property, setValue, isEditing]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleImageSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (imagePreview && !imagePreview.isExisting) {
      URL.revokeObjectURL(imagePreview.url);
    }

    const file = files[0];
    const url = URL.createObjectURL(file);
    const id = `${Date.now()}-${Math.random()}`;

    setImagePreview({ file, url, id });
  };

  const handleRemoveImage = () => {
    if (imagePreview && !imagePreview.isExisting) {
      URL.revokeObjectURL(imagePreview.url);
    }
    setImagePreview(null);
  };

  useEffect(() => {
    return () => {
      if (imagePreview && !imagePreview.isExisting) {
        URL.revokeObjectURL(imagePreview.url);
      }
    };
  }, []);

  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!token || !isEditing) return;

      try {
        const [typesResponse, areasResponse] = await Promise.all([
          getData(
            "types",
            {},
            new AxiosHeaders({ Authorization: `Bearer ${token}`, lang: locale })
          ),
          getData(
            "areas",
            {},
            new AxiosHeaders({ Authorization: `Bearer ${token}`, lang: locale })
          ),
        ]);

        if (typesResponse.status) setPropertyTypes(typesResponse.data.data);
        if (areasResponse.status) setAreas(areasResponse.data.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        showToast(t("error_fetching_dropdown_data"), "error");
      }
    };

    fetchDropdownData();
  }, [token, locale, t, isEditing]);

  const onSubmit = async (data: FormInputs) => {
    const formData = new FormData();

    // General fields
    formData.append("_method", "PUT");

    formData.append("type_id", data.type_id);
    formData.append("price", data.price);
    formData.append("sqt", data.sqt);
    formData.append("bedroom", data.bedroom);
    formData.append("bathroom", data.bathroom);
    formData.append("kitichen", data.kitchen);
    formData.append("status", data.status);
    formData.append("immediate_delivery", data.immediate_delivery);
    formData.append("furnishing", data.furnishing);
    formData.append("payment_method", data.payment_method);

    // Conditional fields (installment)
    if (data.payment_method === "installment") {
      if (data.down_price) formData.append("down_price", data.down_price);
      if (data.paid_months) formData.append("paid_months", data.paid_months);
    }

    // Mortgage (optional)
    if (data.mortgage) {
      formData.append("mortgage", data.mortgage);
    }

    // Location
    if (locationData) {
      formData.append("location", locationData.description);
      formData.append("location_place_id", locationData.placeId);

      if (locationData.coordinates) {
        formData.append(
          "location_lat",
          locationData.coordinates.lat.toString()
        );
        formData.append(
          "location_lng",
          locationData.coordinates.lng.toString()
        );
      }
    }

    // English
    formData.append("title[en]", data.title_en);
    formData.append("description[en]", descriptionEn);
    formData.append("keywords[en]", data.keywords_en);
    formData.append("slug[en]", data.slug_en);

    // Arabic
    formData.append("title[ar]", data.title_ar);
    formData.append("description[ar]", descriptionAr);
    formData.append("keywords[ar]", data.keywords_ar);
    formData.append("slug[ar]", data.slug_ar);

    // Cover image (only if new image selected)
    if (imagePreview && imagePreview.file) {
      formData.append("cover", imagePreview.file);
    }

    try {
      const response = await postData(
        `agent/property_listings/${property.data.id}`,
        formData,
        new AxiosHeaders({ Authorization: `Bearer ${token}` })
      );

      showToast(t("property_updated_successfully"), "success");
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to update property:", error);
      showToast(t("failed_to_update_property"), "error");
    }
  };

  const SectionHeader = ({
    title,
    icon,
    sectionKey,
    description,
  }: {
    title: string;
    icon: React.ReactNode;
    sectionKey: keyof typeof expandedSections;
    description?: string;
  }) => (
    <div
      className="section-header d-flex justify-content-between align-items-center p-4 cursor-pointer border-0"
      onClick={() => toggleSection(sectionKey)}
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        transition: "all 0.3s ease",
        borderRadius: "0.75rem 0.75rem 0 0",
      }}
    >
      <div className="d-flex align-items-center gap-4">
        <div
          className="icon-container d-flex align-items-center justify-content-center me-3"
          style={{
            width: "48px",
            height: "48px",
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            transition: "transform 0.3s ease",
          }}
        >
          {icon}
        </div>
        <div>
          <h3 className="h5 mb-1 fw-semibold text-dark">{title}</h3>
          {description && (
            <p className="small text-muted mb-0 opacity-75">{description}</p>
          )}
        </div>
      </div>
      <div className="d-flex align-items-center">
        <div
          className="status-indicator me-3"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: expandedSections[sectionKey]
              ? "#198754"
              : "#6c757d",
            transition: "all 0.3s ease",
            boxShadow: expandedSections[sectionKey]
              ? "0 0 8px rgba(25,135,84,0.3)"
              : "none",
          }}
        ></div>
        <div
          className="chevron-icon"
          style={{
            transition: "transform 0.3s ease",
            transform: expandedSections[sectionKey]
              ? "rotate(180deg)"
              : "rotate(0deg)",
          }}
        >
          <ChevronDown className="w-5 h-5 text-muted" />
        </div>
      </div>
    </div>
  );

  const InputField = ({
    label,
    name,
    type = "text",
    required = false,
    options = [],
    dir = "ltr",
    placeholder = "",
  }: {
    label: string;
    name: keyof FormInputs;
    type?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    dir?: string;
    placeholder?: string;
  }) => (
    <div className="mb-4">
      <label className="form-label fw-medium text-dark mb-2">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      {type === "select" ? (
        <select
          {...register(name, { required })}
          className="form-select premium-input"
          dir={dir}
          style={{
            border: "2px solid #e9ecef",
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            fontSize: "0.95rem",
            transition: "all 0.3s ease",
            background: "#ffffff",
          }}
        >
          <option value="">{placeholder || `${t("select")} ${label}`}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...register(name, { required })}
          type={type}
          className="form-control premium-input"
          dir={dir}
          placeholder={placeholder}
          style={{
            border: "2px solid #e9ecef",
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            fontSize: "0.95rem",
            transition: "all 0.3s ease",
            background: "#ffffff",
          }}
        />
      )}
      {errors[name] && (
        <div className="error-message text-danger small mt-2 d-flex align-items-center">
          <div
            className="error-dot me-2"
            style={{
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              backgroundColor: "#dc3545",
            }}
          ></div>
          {t("field_required")}
        </div>
      )}
    </div>
  );

  // If in edit mode, render the edit form
  if (isEditing) {
    return (
      <>
        <style jsx>{`
          .premium-input:focus {
            border-color: #0d6efd !important;
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1) !important;
            outline: none !important;
          }

          .section-header:hover {
            background: linear-gradient(
              135deg,
              #f1f3f4 0%,
              #e2e6ea 100%
            ) !important;
          }

          .section-header:hover .icon-container {
            transform: translateY(-2px) !important;
          }

          .section-content {
            animation: slideDown 0.3s ease-out;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .form-section {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            border: 1px solid #e9ecef;
          }

          .form-section:hover {
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
          }

          .upload-area {
            border: 2px dashed #dee2e6;
            transition: all 0.3s ease;
            background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
          }

          .upload-area:hover {
            border-color: #0d6efd;
            background: linear-gradient(135deg, #f0f7ff 0%, #e7f3ff 100%);
          }

          .btn-premium {
            background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
            border: none;
            border-radius: 0.75rem;
            padding: 0.75rem 2rem;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(13, 110, 253, 0.2);
          }

          .btn-premium:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(13, 110, 253, 0.3);
          }

          .btn-outline-premium {
            border: 2px solid #6c757d;
            border-radius: 0.75rem;
            padding: 0.75rem 2rem;
            font-weight: 600;
            transition: all 0.3s ease;
            background: transparent;
          }

          .btn-outline-premium:hover {
            background: #6c757d;
            color: white;
            transform: translateY(-2px);
          }
        `}</style>

        <div className="min-vh-100">
          <div className="container py-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="h3 fw-bold text-dark mb-0">
                {t("edit_property")}
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Basic Information */}
              <div className="form-section bg-white rounded-4 mb-4">
                <SectionHeader
                  title={t("basic_information")}
                  icon={<Home className="w-5 h-5 text-primary" />}
                  sectionKey="basic"
                  description={t("property_type_location_details")}
                />
                {expandedSections.basic && (
                  <div
                    className="section-content p-4"
                    style={{ borderTop: "1px solid #f8f9fa" }}
                  >
                    <div className="row g-4">
                      <div className="col-md-6 col-lg-4">
                        <InputField
                          label={t("property_type")}
                          name="type_id"
                          type="select"
                          required
                          options={propertyTypes.map((type) => ({
                            value: type.id.toString(),
                            label: type.descriptions?.en?.title || type.title,
                          }))}
                          placeholder={t("select_type")}
                        />
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <InputField
                          label={t("area")}
                          name="area_id"
                          type="select"
                          required
                          options={areas.map((area) => ({
                            value: area.id.toString(),
                            label: area.description?.en?.name || area.name,
                          }))}
                          placeholder={t("select_area")}
                        />
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <label className="form-label fw-medium text-dark mb-2">
                          {t("location")}
                        </label>
                        <GoogleLocationInput
                          onLocationChange={(data) => setLocationData(data)}
                          defaultValue={
                            locationData?.description || "Colorado, USA"
                          }
                          placeholder={t("search_for_a_location")}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing Information */}
              <div className="form-section bg-white rounded-4 mb-4 overflow-hidden">
                <SectionHeader
                  title={t("pricing_financial_details")}
                  icon={<DollarSign className="w-5 h-5 text-success" />}
                  sectionKey="pricing"
                  description={t("property_pricing_payment_info")}
                />
                {expandedSections.pricing && (
                  <div className="p-4 row g-4">
                    <div className="col-12 col-md-6">
                      <InputField
                        label={t("price")}
                        name="price"
                        type="number"
                        required
                        placeholder={t("enter_property_price")}
                      />
                    </div>

                    {/* Payment Method Toggle */}
                    <div className="col-12 col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-medium text-dark">
                          {t("payment_method")}
                          <span className="text-danger ms-1">*</span>
                        </label>
                        <div className="btn-group w-100 shadow-sm" role="group">
                          <button
                            type="button"
                            onClick={() => setValue("payment_method", "cash")}
                            className={`btn d-flex align-items-center justify-content-center gap-2 ${
                              paymentMethod === "cash"
                                ? "btn-primary text-white"
                                : "btn-outline-secondary"
                            }`}
                            style={
                              paymentMethod === "cash"
                                ? {
                                    backgroundColor: "#F26A3F",
                                    borderColor: "#F26A3F",
                                  }
                                : {}
                            }
                          >
                            <Coins
                              className="w-4 h-4"
                              style={{ width: "1rem", height: "1rem" }}
                            />
                            {t("cash")}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setValue("payment_method", "installment")
                            }
                            className={`btn d-flex align-items-center justify-content-center gap-2 ${
                              paymentMethod === "installment"
                                ? "btn-primary text-white"
                                : "btn-outline-secondary"
                            }`}
                            style={
                              paymentMethod === "installment"
                                ? {
                                    backgroundColor: "#F26A3F",
                                    borderColor: "#F26A3F",
                                  }
                                : {}
                            }
                          >
                            <CreditCard
                              className="w-4 h-4"
                              style={{ width: "1rem", height: "1rem" }}
                            />
                            {t("installment")}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Down Payment & Paid Months (only if installment) */}
                    {paymentMethod === "installment" && (
                      <>
                        <div className="col-12 col-md-6">
                          <InputField
                            label={t("down_price")}
                            name="down_price"
                            type="number"
                            required
                            placeholder={t("enter_down_payment_amount")}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <InputField
                            label={t("number_of_months")}
                            name="paid_months"
                            type="number"
                            required
                            placeholder={t(
                              "enter_number_of_installment_months"
                            )}
                          />
                        </div>
                      </>
                    )}

                    {/* Mortgage Input */}
                    {/* <div className="col-12">
                      <div
                        className="mb-3"
                        dir={locale === "ar" ? "rtl" : "ltr"}
                      >
                        <label className="form-label fw-medium text-dark">
                          {t("mortgage")}
                        </label>
                        <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded border">
                          <div className="d-flex align-items-center gap-3">
                            <div className="p-2 bg-white rounded shadow-sm">
                              <Home
                                className="w-4 h-4"
                                style={{
                                  width: "1rem",
                                  height: "1rem",
                                  color: "#F26A3F",
                                }}
                              />
                            </div>
                            <div>
                              <p className="small fw-medium text-dark mb-0">
                                {t("mortgage_available")}
                              </p>
                              <p className="small text-muted mb-0">
                                {t("mortgage_placeholder")}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const currentValue = watch("mortgage") === "yes";
                              setValue("mortgage", currentValue ? "no" : "yes");
                            }}
                            className="btn p-0 border-0"
                            style={{
                              width: "3rem",
                              height: "1.75rem",
                              borderRadius: "1rem",
                              backgroundColor:
                                watch("mortgage") === "yes"
                                  ? "#F26A3F"
                                  : "#6c757d",
                              position: "relative",
                              transition: "all 0.3s ease",
                            }}
                          >
                            <span
                              className="position-absolute bg-white rounded-circle shadow-sm"
                              style={{
                                width: "1.25rem",
                                height: "1.25rem",
                                top: "0.25rem",
                                left:
                                  watch("mortgage") === "yes"
                                    ? locale === "ar"
                                      ? "0.25rem"
                                      : "1.5rem"
                                    : locale === "ar"
                                    ? "1.5rem"
                                    : "0.25rem",
                                transition: "all 0.3s ease",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {watch("mortgage") === "yes" && (
                                <Check
                                  className="w-3 h-3"
                                  style={{
                                    width: "0.75rem",
                                    height: "0.75rem",
                                    color: "#F26A3F",
                                  }}
                                />
                              )}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div> */}
                  </div>
                )}
              </div>

              {/* Room Configuration */}
              <div className="form-section bg-white rounded-4 mb-4 overflow-hidden">
                <SectionHeader
                  title={t("room_configuration")}
                  icon={<Home className="w-5 h-5 text-warning" />}
                  sectionKey="rooms"
                  description={t("bedrooms_bathrooms_kitchen_details")}
                />
                {expandedSections.rooms && (
                  <div
                    className="section-content p-4"
                    style={{ borderTop: "1px solid #f8f9fa" }}
                  >
                    <div className="row g-4">
                      <div className="col-md-6 col-lg-3">
                        <InputField
                          label={t("square_meters")}
                          name="sqt"
                          type="number"
                          required
                          placeholder={t("property_size")}
                        />
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <InputField
                          label={t("bedroom")}
                          name="bedroom"
                          type="number"
                          required
                          placeholder={t("number_of_bedrooms")}
                        />
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <InputField
                          label={t("bathroom")}
                          name="bathroom"
                          type="number"
                          required
                          placeholder={t("number_of_bathrooms")}
                        />
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <InputField
                          label={t("kitchen")}
                          name="kitchen"
                          type="number"
                          required
                          placeholder={t("number_of_kitchens")}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="form-section bg-white rounded-4 mb-4 overflow-hidden">
                <SectionHeader
                  title={t("property_details")}
                  icon={<FileText className="w-5 h-5 text-info" />}
                  sectionKey="details"
                  description={t("status_type_delivery_info")}
                />
                {expandedSections.details && (
                  <div
                    className="section-content p-4"
                    style={{ borderTop: "1px solid #f8f9fa" }}
                  >
                    <div className="row g-4">
                      <div className="col-md-6 col-lg-4">
                        <InputField
                          label={t("status")}
                          name="status"
                          type="select"
                          required
                          options={[
                            { value: "rent", label: t("rent") },
                            { value: "sale", label: t("sale") },
                          ]}
                          placeholder={t("select_status")}
                        />
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <InputField
                          label={t("immediate_delivery")}
                          name="immediate_delivery"
                          type="select"
                          required
                          options={[
                            { value: "yes", label: t("yes") },
                            { value: "no", label: t("no") },
                          ]}
                          placeholder={t("select_option")}
                        />
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <InputField
                          label={t("furnishing")}
                          name="furnishing"
                          type="select"
                          required
                          options={[
                            { value: "all-furnished", label: t("furnished") },
                            { value: "unfurnished", label: t("unfurnished") },
                            {
                              value: "partly-furnished",
                              label: t("partly_furnished"),
                            },
                          ]}
                          placeholder={t("select_furnishing")}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Arabic Content */}
              <div className="form-section bg-white rounded-4 mb-4 overflow-hidden">
                <SectionHeader
                  title={t("arabic_content")}
                  icon={<Globe className="w-5 h-5 text-success" />}
                  sectionKey="arabic"
                  description={t("arabic_title_description_seo")}
                />
                {expandedSections.arabic && (
                  <div
                    className="section-content p-4"
                    style={{ borderTop: "1px solid #f8f9fa" }}
                  >
                    <div className="row g-4">
                      <div className="col-md-6">
                        <InputField
                          label={t("title_ar")}
                          name="title_ar"
                          required
                          dir="rtl"
                          placeholder={t("title_arabic_placeholder")}
                        />
                      </div>
                      <div className="col-md-6">
                        <InputField
                          label={t("slug_ar")}
                          name="slug_ar"
                          required
                          dir="rtl"
                          placeholder={t("slug_arabic_placeholder")}
                        />
                      </div>
                    </div>
                    <InputField
                      label={t("keywords_ar")}
                      name="keywords_ar"
                      required
                      dir="rtl"
                      placeholder={t("keywords_arabic_placeholder")}
                    />
                    <div>
                      <label className="form-label fw-medium text-dark mb-2">
                        {t("description_ar")}{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <div
                        className="border rounded-3"
                        style={{ borderWidth: "2px", borderColor: "#e9ecef" }}
                      >
                        <RichTextEditor
                          value={descriptionAr}
                          onChange={setDescriptionAr}
                          label=""
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* English Content */}
              <div className="form-section bg-white rounded-4 mb-4 overflow-hidden">
                <SectionHeader
                  title={t("english_content")}
                  icon={<Globe className="w-5 h-5 text-primary" />}
                  sectionKey="english"
                  description={t("english_title_description_seo")}
                />
                {expandedSections.english && (
                  <div
                    className="section-content p-4"
                    style={{ borderTop: "1px solid #f8f9fa" }}
                  >
                    <div className="row g-4">
                      <div className="col-md-6">
                        <InputField
                          label={t("title_en")}
                          name="title_en"
                          required
                          placeholder={t("title_english_placeholder")}
                        />
                      </div>
                      <div className="col-md-6">
                        <InputField
                          label={t("slug_en")}
                          name="slug_en"
                          required
                          placeholder={t("slug_english_placeholder")}
                        />
                      </div>
                    </div>
                    <InputField
                      label={t("keywords_en")}
                      name="keywords_en"
                      required
                      placeholder={t("keywords_english_placeholder")}
                    />
                    <div>
                      <label className="form-label fw-medium text-dark mb-2">
                        {t("description_en")}{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <div
                        className="border rounded-3"
                        style={{ borderWidth: "2px", borderColor: "#e9ecef" }}
                      >
                        <RichTextEditor
                          value={descriptionEn}
                          onChange={setDescriptionEn}
                          label=""
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Single Image Upload */}
              <div className="form-section bg-white rounded-4 mb-4 overflow-hidden">
                <SectionHeader
                  title={t("property_image")}
                  icon={<Camera className="w-5 h-5 text-danger" />}
                  sectionKey="images"
                  description={t("upload_high_quality_photo")}
                />
                {expandedSections.images && (
                  <div
                    className="section-content p-4"
                    style={{ borderTop: "1px solid #f8f9fa" }}
                  >
                    <div className="upload-area rounded-3 p-5">
                      {!imagePreview ? (
                        <div className="text-center">
                          <label
                            className="btn btn-outline-primary rounded-3 px-4 py-2"
                            style={{
                              border: "2px solid #0d6efd",
                              fontWeight: "600",
                              transition: "all 0.3s ease",
                            }}
                          >
                            {t("click_to_upload_image")}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageSelect(e.target.files)
                              }
                              className="d-none"
                            />
                          </label>
                          <p className="small text-muted mt-3 mb-0">
                            {t("select_high_quality_image")}
                          </p>
                        </div>
                      ) : (
                        <div className="position-relative">
                          <div
                            className="image-container rounded-3 overflow-hidden"
                            style={{
                              maxHeight: "400px",
                              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                            }}
                          >
                            <Image
                              width={800}
                              height={400}
                              src={imagePreview.url}
                              alt={t("property_preview")}
                              className="w-100 h-100 object-cover"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                          <div className="position-absolute top-0 end-0 p-3">
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="btn btn-danger rounded-circle p-2"
                              style={{
                                width: "40px",
                                height: "40px",
                                boxShadow: "0 4px 15px rgba(220,53,69,0.3)",
                                transition: "all 0.3s ease",
                              }}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="position-absolute bottom-0 start-0 p-3">
                            <label
                              className="btn btn-outline-light rounded-3 px-3 py-2"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.9)",
                                color: "#333",
                                border: "1px solid rgba(255,255,255,0.3)",
                                backdropFilter: "blur(10px)",
                              }}
                            >
                              {t("change_image")}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleImageSelect(e.target.files)
                                }
                                className="d-none"
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-center small text-muted mt-3 mb-0">
                      {imagePreview
                        ? t("current_property_image")
                        : t("supported_formats_jpg_png_webp")}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="d-flex justify-content-center gap-4 pt-5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-outline-premium"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="btn btn-premium text-white d-flex align-items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {t("update_property")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }

  // View mode - original MainTab display
  return (
    <div className="mb-4">
      {/* Property Header with Edit Button */}
      <div className="d-flex justify-content-between">
        <div className="d-flex justify-content-between container w-100 mb-4">
          <div>
            <div className="d-flex align-items-center gap-3 mb-3">
              <h4 className="font-weight-bold text-dark mb-0">
                {t("property_title")}: {property?.data?.descriptions?.en?.title}
              </h4>
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                style={{
                  borderRadius: "0.5rem",
                  padding: "0.5rem 1rem",
                  transition: "all 0.3s ease",
                  border: "2px solid #0d6efd",
                }}
              >
                <Edit2
                  className="w-4 h-4"
                  style={{ width: "1rem", height: "1rem" }}
                />
                {t("edit")}
              </button>
            </div>

            {/* Status Badges */}
            <div className="d-flex align-items-center gap-3 flex-wrap justify-content-center">
              {property?.data?.area && (
                <p className="mb-0 text-muted d-flex align-items-center gap-2">
                  {t("area")}:
                  <span className="badge bg-light text-dark rounded-4-3 p-2 shadow-sm">
                    {property?.data?.area?.description?.en?.name}
                  </span>
                </p>
              )}
              <span className="text-muted d-flex align-items-center gap-2">
                {t("approval_status")}:
                <span className="badge bg-primary bg-opacity-75 text-white rounded-4-3 p-2 shadow-sm">
                  {property?.data?.approval_status}
                </span>
              </span>

              <span className="text-muted d-flex align-items-center gap-2">
                {t("status")}:
                <span className="badge bg-success bg-opacity-75 text-white rounded-4-3 p-2 shadow-sm">
                  {property?.data?.status}
                </span>
              </span>
            </div>
          </div>

          <div className="d-flex flex-column flex-md-row align-items-center justify-content-center text-center">
            {/* Price and Status Section */}
            <div className="d-flex flex-column align-items-center gap-4">
              {/* Price Section */}
              <div className="text-center">
                <div className="h5 font-weight-bold text-primary">
                  EGP {property?.data?.price?.toLocaleString()}
                </div>
                {property?.data?.down_price && (
                  <div className="text-muted small">
                    {t("down_price")}: EGP{" "}
                    {property?.data?.down_price?.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Details Grid */}
      <div className="row mb-4">
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <ReadOnlyField label={t("bedroom")} value={property?.data?.bedroom} />
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <ReadOnlyField
            label={t("bathroom")}
            value={property?.data?.bathroom}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <ReadOnlyField
            label={t("kitichen")}
            value={property?.data?.kitichen}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <ReadOnlyField
            label={t("sqt")}
            value={`${property?.data?.sqt} sq ft`}
          />
        </div>
      </div>

      {/* Payment Method Display */}
      {property?.data?.payment_method && (
        <div className="row mb-4">
          <div className="col-12 col-md-6 col-lg-3 mb-3">
            <ReadOnlyField
              label={t("payment_method")}
              value={
                property?.data?.payment_method === "cash"
                  ? t("cash")
                  : t("installment")
              }
            />
          </div>
          {property?.data?.payment_method === "installment" &&
            property?.data?.paid_months && (
              <div className="col-12 col-md-6 col-lg-3 mb-3">
                <ReadOnlyField
                  label={t("installment_months")}
                  value={`${property?.data?.paid_months} ${t("months")}`}
                />
              </div>
            )}
          {property?.data?.mortgage && (
            <div className="col-12 col-md-6 col-lg-3 mb-3">
              <ReadOnlyField
                label={t("mortgage")}
                value={
                  property?.data?.mortgage === "yes"
                    ? t("available")
                    : t("not_available")
                }
              />
            </div>
          )}
          {property?.data?.furnishing && (
            <div className="col-12 col-md-6 col-lg-3 mb-3">
              <ReadOnlyField
                label={t("furnishing")}
                value={
                  property?.data?.furnishing === "all-furnished"
                    ? t("furnished")
                    : property?.data?.furnishing === "unfurnished"
                    ? t("unfurnished")
                    : property?.data?.furnishing === "partly-furnished"
                    ? t("partly_furnished")
                    : property?.data?.furnishing
                }
              />
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div className="mb-4">
        <label className="form-label font-weight-medium text-dark mb-2">
          {t("description")}
        </label>
        <div
          className="w-100 p-4 border rounded bg-light border-muted text-dark min-h-100 shadow-sm"
          dangerouslySetInnerHTML={{
            __html: property?.data?.descriptions?.en?.description || "",
          }}
        />
      </div>

      {/* Property Statistics */}
      <div className="mb-4">
        <h3 className="h5 font-weight-semibold text-dark mb-3">
          {t("property_statistics")}
        </h3>
        <div className="d-flex justify-content-between">
          <div className="text-muted">
            <strong>{t("count_call")}: </strong>
            {propertystat?.data?.count_call}
          </div>
          <div className="text-muted">
            <strong>{t("count_whatsapp")}: </strong>
            {propertystat?.data?.count_whatsapp}
          </div>
        </div>
      </div>

      {/* Location Information */}
      {property?.data?.property_locations &&
        property?.data?.property_locations.length > 0 && (
          <div className="mb-4">
            <h3 className="h5 font-weight-semibold text-dark mb-3">
              {t("location")}
            </h3>
            <div className="card shadow-sm border-muted rounded">
              <div className="card-body">
                <div className="text-muted">
                  <strong>{t("address")} </strong>
                  {property?.data?.property_locations[0]?.location}
                </div>
                {/* {property?.data?.property_locations[0]?.location_lat &&
                  property?.data?.property_locations[0]?.location_lng && (
                    <div className="text-muted small mt-2">
                      <strong>{t("coordinates")}: </strong>
                      {property?.data?.property_locations[0]?.location_lat.toFixed(
                        6
                      )}
                      ,{" "}
                      {property?.data?.property_locations[0]?.location_lng.toFixed(
                        6
                      )}
                    </div>
                  )} */}
              </div>
            </div>
          </div>
        )}

      {/* Features */}
      {property?.data?.features && property?.data?.features.length > 0 && (
        <div className="mb-4">
          <h3 className="h5 font-weight-semibold text-dark mb-3">
            {t("features")}
          </h3>
          <div className="row">
            {property?.data?.features.map((feature, index) => (
              <div className="col-md-6 col-lg-4 mb-2" key={index}>
                <div className="border rounded p-3 bg-light">
                  <strong>
                    {feature.key_translations?.en || feature.key}:
                  </strong>{" "}
                  {feature.value_translations?.en || feature.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amenities */}
      {property?.data?.amenities && property?.data?.amenities.length > 0 && (
        <div className="mb-4">
          <h3 className="h5 font-weight-semibold text-dark mb-3">
            {t("amenities")}
          </h3>
          <div className="row">
            {property?.data?.amenities.map((amenity, index) => (
              <div className="col-md-6 col-lg-4 mb-3" key={index}>
                <div className="card shadow-sm border-muted rounded">
                  <div className="card-body d-flex align-items-center gap-3">
                    {amenity.image && (
                      <Image
                        src={amenity.image}
                        alt={amenity.descriptions?.en?.title || amenity.title}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    )}
                    <div>
                      {amenity.descriptions?.en?.title || amenity.title}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Owner Information */}
      <div className="mb-4">
        <h3 className="h5 font-weight-semibold text-dark mb-3">
          {t("owner_information")}
        </h3>
        <div className="card shadow-sm border-muted rounded">
          <div className="card-body">
            <div className="d-flex align-items-center gap-3">
              {property?.data?.user?.avatar && (
                <Image
                  src={property.data.user.avatar || defaultAvatar}
                  alt={property?.data?.user?.name}
                  width={150}
                  height={150}
                  className="rounded-4"
                />
              )}
              <div>
                <div className="font-weight-medium text-dark">
                  {t("name")}: {property?.data?.user?.name}
                </div>
                <div className="text-muted">
                  {t("email")}: {property?.data?.user?.email}
                </div>
                {property?.data?.user?.phone ? (
                  <div className="text-muted py-2">
                    {t("phone")}: {property?.data?.user?.phone}

                  </div>
                ) : (
                  <div className="text-muted font-weight-bold">
                    {t("phone_not_found")}
                  </div>
                )}
                <label className="text-muted font-weight-bold">
                  {t("module")}
                </label>
                <div className="text-muted row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 py-2">
                  {property?.data?.user?.modules.map((module, index) => (
                    <div className="col mb-2" key={index}>
                      <div className="border rounded p-2">
                        {module as unknown as string}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
