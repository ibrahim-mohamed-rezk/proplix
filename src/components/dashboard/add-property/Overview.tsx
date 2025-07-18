"use client";

import React, { useState, useEffect } from "react";
import GoogleLocationInput from "@/components/common/GoogleLocationInput";
import { useForm } from "react-hook-form";
import { postData, getData } from "@/libs/server/backendServer";
import { AxiosHeaders } from "axios";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import RichTextEditor from "@/components/RichTextEditor";
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  Home,
  FileText,
  Globe,
  Camera,
  Check,
  X,
} from "lucide-react";
import Image from "next/image";
import { useLocale } from "next-intl";

type FormInputs = {
  // General Information
  type_id: string;
  area_id: string;
  // userId: string;
  price: string;
  down_price: string;
  sqt: string;
  bedroom: string;
  bathroom: string;
  kitchen: string;
  status: string;
  type: string;
  immediate_delivery: string;

  // English fields
  title_en: string;
  description_en: string;
  keywords_en: string;
  slug_en: string;

  // Arabic fields
  title_ar: string;
  description_ar: string;
  keywords_ar: string;
  slug_ar: string;
};

type SelectOption = {
  id: string;
  title?: string;
  name?: string;
};

type AreaOption = {
  id: number;
  image: string;
  count_of_properties: number;
  name: string;
  description: {
    en: {
      name: string;
    };
    ar: {
      name: string;
    };
  };
};

interface LocationData {
  description: string;
  placeId: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

type AgentOption = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
};

type ImagePreview = {
  file: File;
  url: string;
  id: string;
};

const CreatePropertyPage = ({ token }: { token: string }) => {
  const t = useTranslations("properties");
  const router = useRouter();
  const locale = useLocale();
  const {
    register,
    handleSubmit,
    formState: { errors },
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

  // State for dropdown options
  const [propertyTypes, setPropertyTypes] = useState<SelectOption[]>([]);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  // const [agents, setAgents] = useState<AgentOption[]>([]);
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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleImageSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview.url);
    }

    const file = files[0];
    const url = URL.createObjectURL(file);
    const id = `${Date.now()}-${Math.random()}`;

    setImagePreview({ file, url, id });
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview.url);
      setImagePreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview.url);
      }
    };
  }, []);

  useEffect(() => {
    const fetchDropdownData = async () => {
      // const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      if (!token) {
        showToast(t("auth_token_not_found"), "error");
        return;
      }

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
          // getData("owner/agents", {}, new AxiosHeaders({ Authorization: `Bearer ${token}` }))
        ]);

        if (typesResponse.status) setPropertyTypes(typesResponse.data.data);
        if (areasResponse.status) setAreas(areasResponse.data.data);
        // setAgents(agentsResponse);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        showToast(t("error_fetching_dropdown_data"), "error");
      }
    };

    fetchDropdownData();
  }, []);

  const onSubmit = async (data: FormInputs) => {
    // const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (!token) {
      showToast(t("auth_token_not_found"), "error");
      return;
    }

    if (!imagePreview) {
      showToast(t("please_select_an_image"), "error");
      return;
    }

    const formData = new FormData();

    formData.append("type_id", data.type_id);
    formData.append("area_id", data.area_id);
    // formData.append("user_id", data.userId);
    formData.append("price", data.price);
    formData.append("down_price", data.down_price);
    formData.append("sqt", data.sqt);
    formData.append("bedroom", data.bedroom);
    formData.append("bathroom", data.bathroom);
    formData.append("kitichen", data.kitchen);
    formData.append("status", data.status);
    formData.append("type", data.type);
    formData.append("immediate_delivery", data.immediate_delivery);

    // Send location data as separate fields instead of JSON string
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

    formData.append("title[en]", data.title_en);
    formData.append("description[en]", descriptionEn);
    formData.append("keywords[en]", data.keywords_en);
    formData.append("slug[en]", data.slug_en);

    formData.append("title[ar]", data.title_ar);
    formData.append("description[ar]", descriptionAr);
    formData.append("keywords[ar]", data.keywords_ar);
    formData.append("slug[ar]", data.slug_ar);

    formData.append("cover", imagePreview.file);

    try {
      const response = await postData(
        "agent/property_listings",
        formData,
        new AxiosHeaders({ Authorization: `Bearer ${token}` })
      );
      showToast(t("property_added_successfully"), "success");
      router.push(`/properties/edit-property/${response?.data?.id}`);
    } catch (error) {
      console.error("Failed to create property:", error);
      showToast(t("failed_to_add_property"), "error");
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
      className="section-header d-flex justify-content-between align-items-center p-4   cursor-pointer border-0"
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

        .hero-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 1.5rem;
          padding: 3rem 2rem;
          margin-bottom: 3rem;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23000" opacity="0.02"/><circle cx="75" cy="75" r="1" fill="%23000" opacity="0.02"/><circle cx="50" cy="10" r="1" fill="%23000" opacity="0.02"/><circle cx="10" cy="90" r="1" fill="%23000" opacity="0.02"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          pointer-events: none;
        }

        .hero-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          box-shadow: 0 8px 30px rgba(13, 110, 253, 0.3);
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      <div className="min-vh-100">
        <div className="container py-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="form-section bg-white rounded-4 mb-4 ">
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
                          value: type.id,
                          label: type.title || "",
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
                          label: `${area?.name}`,
                        }))}
                        placeholder={t("select_area")}
                      />
                    </div>
                    <div className="col-md-6 col-lg-4 ">
                      <label className="form-label fw-medium text-dark mb-2">
                        {t("location")}
                      </label>
                      <GoogleLocationInput
                        onLocationChange={(data) => setLocationData(data)}
                        defaultValue="Colorado, USA"
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
                <div
                  className="section-content p-4"
                  style={{ borderTop: "1px solid #f8f9fa" }}
                >
                  <div className="row g-4">
                    <div className="col-md-6">
                      <InputField
                        label={t("price")}
                        name="price"
                        type="number"
                        required
                        placeholder={t("enter_property_price")}
                      />
                    </div>
                    <div className="col-md-6">
                      <InputField
                        label={t("down_price")}
                        name="down_price"
                        type="number"
                        required
                        placeholder={t("enter_down_payment_amount")}
                      />
                    </div>
                  </div>
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
                        label={t("type")}
                        name="type"
                        type="select"
                        required
                        options={[
                          { value: "apartment", label: t("apartment") },
                          { value: "office", label: t("office") },
                        ]}
                        placeholder={t("select_type")}
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
                            onChange={(e) => handleImageSelect(e.target.files)}
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
                      </div>
                    )}
                  </div>
                  <p className="text-center small text-muted mt-3 mb-0">
                    {imagePreview
                      ? t("hover_over_image_to_change_or_remove")
                      : t("supported_formats_jpg_png_webp")}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-center gap-4 pt-5">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-outline-premium"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="btn btn-premium text-white d-flex align-items-center gap-2"
              >
                <Check className="w-5 h-5" />
                {t("create_property")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreatePropertyPage;
