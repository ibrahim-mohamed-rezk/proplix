"use client";

import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import { useForm } from "react-hook-form";
import { postData, getData } from "@/libs/server/backendServer";
import { AxiosHeaders } from "axios";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import RichTextEditor from "@/components/RichTextEditor";
import { toast } from "react-toastify";
import Image from "next/image";

type FormInputs = {
  // General Information
  type_id: string;
  area_id: string;
  price: string;
  down_price: string;
  sqt: string;
  bedroom: string;
  bathroom: string;
  kitichen : string;
  status: string;
  type: string;
  immediate_delivery: string;
  
  // English fields
  title_en: string;
  description_en: string;
  keywords_en: string;
  slug_en: string;
  meta_title_en: string;
  meta_description_en: string;
  meta_keywords_en: string;
  
  // Arabic fields
  title_ar: string;
  description_ar: string;
  keywords_ar: string;
  slug_ar: string;
  meta_title_ar: string;
  meta_description_ar: string;
  meta_keywords_ar: string;
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

type ImagePreview = {
  file: File;
  url: string;
  id: string;
};

const CreatePropertyPage = ({ token }: { token: string }) => {
  const t = useTranslations("properties");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();
  const [descriptionEn, setDescriptionEn] = useState<string>("");
  const [descriptionAr, setDescriptionAr] = useState<string>("");
  const [imagesPreviews, setImagesPreviews] = useState<ImagePreview[]>([]);

  // State for dropdown values
  const [selectValues, setSelectValues] = useState({
    type_id: '',
    area_id: '',
    status: '',
    type: '',
    immediate_delivery: ''
  });

  // State for dropdown options
  const [propertyTypes, setPropertyTypes] = useState<{ data: SelectOption[] }>({ data: [] });
  const [areas, setAreas] = useState<{data:AreaOption[]}>({data:[]});

  // Dropdown handlers
  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectValues(prev => ({ ...prev, type_id: e.target.value }));
  };

  const handleAreaChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectValues(prev => ({ ...prev, area_id: e.target.value }));
  };

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectValues(prev => ({ ...prev, status: e.target.value }));
  };

  const handleTypeSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectValues(prev => ({ ...prev, type: e.target.value }));
  };

  const handleImmediateDeliveryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectValues(prev => ({ ...prev, immediate_delivery: e.target.value }));
  };

  // Image handling functions
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPreviews: ImagePreview[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      const id = Date.now().toString() + i;

      newPreviews.push({
        file,
        url,
        id
      });
    }

    setImagesPreviews(prev => [...prev, ...newPreviews]);

    // Reset the input value to allow selecting the same files again
    e.target.value = '';
  };

  const removeImage = (imageId: string) => {
    setImagesPreviews(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      imagesPreviews.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, []);

  // Fetch dropdown data on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      try {
        // Fetch types and areas - adjust API endpoints as needed
        const [typesResponse, areasResponse] = await Promise.all([
          getData("types", {}, new AxiosHeaders({ Authorization: `Bearer ${token}` })),
          getData("areas", {}, new AxiosHeaders({ Authorization: `Bearer ${token}` }))
        ]);

        if (typesResponse.status) setPropertyTypes(typesResponse.data);
        if (areasResponse.status) setAreas(areasResponse.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        toast.error("Error fetching dropdown data");
      }
    };

    fetchDropdownData();
  }, [token]);

  const onSubmit = async (data: FormInputs) => {
    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    // Check if required select values are filled
    if (!selectValues.type_id || !selectValues.area_id || !selectValues.status || 
        !selectValues.type || !selectValues.immediate_delivery) {
      toast.error("Please fill all required dropdown fields");
      return;
    }

    console.log('Form data:', data);
    console.log('Select values:', selectValues);

    const formData = new FormData();
    
    // Add general fields - use selectValues for dropdowns
    formData.append("type_id", selectValues.type_id);
    formData.append("area_id", selectValues.area_id);
    formData.append("price", data.price);
    formData.append("down_price", data.down_price);
    formData.append("sqt", data.sqt);
    formData.append("bedroom", data.bedroom);
    formData.append("bathroom", data.bathroom);
    formData.append("kitichen ", data.kitichen ); // Fixed typo from "kitichen"
    formData.append("status", selectValues.status);
    formData.append("type", selectValues.type);
    formData.append("immediate_delivery", selectValues.immediate_delivery);
    
    // Add English fields
    formData.append("title[en]", data.title_en);
    formData.append("description[en]", descriptionEn);
    formData.append("keywords[en]", data.keywords_en);
    formData.append("slug[en]", data.slug_en);
    
    // Add Arabic fields
    formData.append("title[ar]", data.title_ar);
    formData.append("description[ar]", descriptionAr);
    formData.append("keywords[ar]", data.keywords_ar);
    formData.append("slug[ar]", data.slug_ar);

    // Add images
    imagesPreviews.forEach(preview => {
      formData.append("cover", preview.file);
    });

    try {
      await postData("agent/property_listings", formData, new AxiosHeaders({ Authorization: `Bearer ${token}` }));
      toast.success(t("Property added successfully"));
      router.back();
    } catch (error) {
      console.error("Failed to create property:", error);
      toast.error(t("Failed to add property"));
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="">
        <div className="card rounded-4">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit(onSubmit)}>

              {/* Basic Information Section */}
              <div className="accordion mb-4" id="propertyAccordion">

                {/* Property Details */}
                <div className=" mb-3">
                  <h2 className="accordion-header ">
                    <button className="accordion-button fw-semibold bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#propertyDetails" aria-expanded="true">
                      Property Details
                    </button>
                  </h2>
                  <div id="propertyDetails" className="accordion-collapse collapse show" data-bs-parent="#propertyAccordion">
                    <div className="accordion-body">
                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="form-floating">
                            <select
                              className={`form-select ${!selectValues.type_id ? 'is-invalid' : ''}`}
                              value={selectValues.type_id}
                              onChange={handleTypeChange}
                              style={{
                                border: '2px solid #e9ecef',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '500',
                                color: '#495057',
                                backgroundColor: '#fff',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                height: '5vw', // Much taller height
                                paddingTop: '28px', // Increased padding for floating label
                                paddingBottom: '0px',
                                lineHeight: '1' // Better line spacing
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#0d6efd';
                                e.target.style.boxShadow = '0 0 0 0.25rem rgba(13, 110, 253, 0.25)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#e9ecef';
                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                              }}
                            >
                              <option value="">{t("Select Type")}</option>
                              {propertyTypes?.data?.map((type) => (
                                <option key={type.id} value={type.id}>
                                  {type.title || type.name || ""}
                                </option>
                              ))}
                            </select>
                            <label className="fw-medium">{t("Property Type")} *</label>
                            {!selectValues.type_id && (
                              <div className="invalid-feedback d-block">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <select
                              className={`form-select ${!selectValues.area_id ? 'is-invalid' : ''}`}
                              value={selectValues.area_id}
                              onChange={handleAreaChange}
                              style={{
                                border: '2px solid #e9ecef',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '500',
                                color: '#495057',
                                backgroundColor: '#fff',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                height: '5vw', // Much taller height
                                paddingTop: '28px', // Increased padding for floating label
                                paddingBottom: '0px',
                                lineHeight: '1' // Better line spacing
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#0d6efd';
                                e.target.style.boxShadow = '0 0 0 0.25rem rgba(13, 110, 253, 0.25)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#e9ecef';
                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                              }}
                            >
                              <option value="">{t("Select Area")}</option>
                              {areas?.data?.map((area) => (
                                <option key={area.id} value={area.id.toString()}>
                                  {`${area.name} / ${area.name}`}
                                </option>
                              ))}
                            </select>
                            <label className="fw-medium">{t("Area")} *</label>
                            {!selectValues.area_id && (
                              <div className="invalid-feedback d-block">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <select
                              className={`form-select ${!selectValues.status ? 'is-invalid' : ''}`}
                              value={selectValues.status}
                              onChange={handleStatusChange}
                              style={{
                                border: '2px solid #e9ecef',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '500',
                                color: '#495057',
                                backgroundColor: '#fff',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                height: '5vw', // Much taller height
                                paddingTop: '28px', // Increased padding for floating label
                                paddingBottom: '0px',
                                lineHeight: '1' // Better line spacing
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#0d6efd';
                                e.target.style.boxShadow = '0 0 0 0.25rem rgba(13, 110, 253, 0.25)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#e9ecef';
                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                              }}
                            >
                              <option value="">{t("Select Status")}</option>
                              <option value="rent">{t("Rent")}</option>
                              <option value="sale">{t("Sale")}</option>
                            </select>
                            <label className="fw-medium">{t("Status")} *</label>
                            {!selectValues.status && (
                              <div className="invalid-feedback d-block">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <select
                              className={`form-select ${!selectValues.type ? 'is-invalid' : ''}`}
                              value={selectValues.type}
                              onChange={handleTypeSelectChange}
                              style={{
                                border: '2px solid #e9ecef',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '500',
                                color: '#495057',
                                backgroundColor: '#fff',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                height: '5vw', // Much taller height
                                paddingTop: '28px', // Increased padding for floating label
                                paddingBottom: '0px',
                                lineHeight: '1' // Better line spacing
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#0d6efd';
                                e.target.style.boxShadow = '0 0 0 0.25rem rgba(13, 110, 253, 0.25)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#e9ecef';
                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                              }}
                            >
                              <option value="">{t("Select Type")}</option>
                              <option value="apartment">{t("Apartment")}</option>
                              <option value="office">{t("Office")}</option>
                            </select>
                            <label className="fw-medium">{t("Type")} *</label>
                            {!selectValues.type && (
                              <div className="invalid-feedback d-block">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <select
                              className={`form-select ${!selectValues.immediate_delivery ? 'is-invalid' : ''}`}
                              value={selectValues.immediate_delivery}
                              onChange={handleImmediateDeliveryChange}
                              style={{
                                border: '2px solid #e9ecef',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '500',
                                color: '#495057',
                                backgroundColor: '#fff',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                height: '5vw', // Much taller height
                                paddingTop: '28px', // Increased padding for floating label
                                paddingBottom: '0px',
                                lineHeight: '1' // Better line spacing
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#0d6efd';
                                e.target.style.boxShadow = '0 0 0 0.25rem rgba(13, 110, 253, 0.25)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#e9ecef';
                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                              }}
                            >
                              <option value="">{t("Select Option")}</option>
                              <option value="yes">{t("Yes")}</option>
                              <option value="no">{t("No")}</option>
                            </select>
                            <label className="fw-medium">{t("Immediate Delivery")} *</label>
                            {!selectValues.immediate_delivery && (
                              <div className="invalid-feedback d-block">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="accordion-item border-0 shadow-sm mb-3 rounded-3">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-semibold bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#pricingInfo">
                      Pricing Information
                    </button>
                  </h2>
                  <div id="pricingInfo" className="accordion-collapse collapse" data-bs-parent="#propertyAccordion">
                    <div className="accordion-body">
                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              {...register("price", { required: true })}
                              type="number"
                              className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                              placeholder={t("Your Price")}
                            />
                            <label className="fw-medium">{t("Price")} *</label>
                            {errors.price && (
                              <div className="invalid-feedback">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              {...register("down_price", { required: true })}
                              type="number"
                              className={`form-control ${errors.down_price ? 'is-invalid' : ''}`}
                              placeholder={t("Down Price")}
                            />
                            <label className="fw-medium">{t("Down Price")} *</label>
                            {errors.down_price && (
                              <div className="invalid-feedback">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              {...register("sqt", { required: true })}
                              type="number"
                              className={`form-control ${errors.sqt ? 'is-invalid' : ''}`}
                              placeholder={t("Square Meters")}
                            />
                            <label className="fw-medium">{t("Square Meters")} *</label>
                            {errors.sqt && (
                              <div className="invalid-feedback">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Configuration */}
                <div className="accordion-item border-0 shadow-sm mb-3 rounded-3">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-semibold bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#roomConfig">
                      Room Configuration
                    </button>
                  </h2>
                  <div id="roomConfig" className="accordion-collapse collapse" data-bs-parent="#propertyAccordion">
                    <div className="accordion-body">
                      <div className="row g-4">
                        <div className="col-md-4">
                          <div className="form-floating">
                            <input
                              {...register("bedroom", { required: true })}
                              type="number"
                              className={`form-control ${errors.bedroom ? 'is-invalid' : ''}`}
                              placeholder={t("Number of Bedrooms")}
                            />
                            <label className="fw-medium">{t("Bedroom")} *</label>
                            {errors.bedroom && (
                              <div className="invalid-feedback">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="form-floating">
                            <input
                              {...register("bathroom", { required: true })}
                              type="number"
                              className={`form-control ${errors.bathroom ? 'is-invalid' : ''}`}
                              placeholder={t("Number of Bathrooms")}
                            />
                            <label className="fw-medium">{t("Bathroom")} *</label>
                            {errors.bathroom && (
                              <div className="invalid-feedback">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="form-floating">
                            <input
                              {...register("kitichen", { required: true })}
                              type="number"
                              className={`form-control ${errors.kitichen ? 'is-invalid' : ''}`}
                              placeholder={t("Number of kitichen s")}
                            />
                            <label className="fw-medium">{t("kitchen")} *</label>
                            {errors.kitichen && (
                              <div className="invalid-feedback">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arabic Content */}
                <div className="accordion-item border-0 shadow-sm mb-3 rounded-3">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-semibold bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#arabicContent">
                      Arabic Content
                    </button>
                  </h2>
                  <div id="arabicContent" className="accordion-collapse collapse" data-bs-parent="#propertyAccordion">
                    <div className="accordion-body">
                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              {...register("title_ar", { required: true })}
                              className={`form-control ${errors.title_ar ? 'is-invalid' : ''}`}
                              placeholder={t("Property Title in Arabic")}
                              dir="rtl"
                            />
                            <label className="fw-medium">{t("Title (AR)")} *</label>
                            {errors.title_ar && (
                              <div className="invalid-feedback">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              {...register("slug_ar", { required: true })}
                              className={`form-control ${errors.slug_ar ? 'is-invalid' : ''}`}
                              placeholder={t("URL Slug in Arabic")}
                              dir="rtl"
                            />
                            <label className="fw-medium">{t("Slug (AR)")} *</label>
                            {errors.slug_ar && (
                              <div className="invalid-feedback">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="form-floating">
                            <input
                              {...register("keywords_ar", { required: true })}
                              className={`form-control ${errors.keywords_ar ? 'is-invalid' : ''}`}
                              placeholder={t("Keywords in Arabic")}
                              dir="rtl"
                            />
                            <label className="fw-medium">{t("Keywords (AR)")} *</label>
                            {errors.keywords_ar && (
                              <div className="invalid-feedback">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-medium">{t("Description (AR)")} *</label>
                          <div className="border rounded-3 p-3 bg-light">
                            <RichTextEditor
                              value={descriptionAr}
                              onChange={setDescriptionAr}
                              label=""
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* English Content */}
                <div className="accordion-item border-0 shadow-sm mb-3 rounded-3">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-semibold bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#englishContent">
                      English Content
                    </button>
                  </h2>
                  <div id="englishContent" className="accordion-collapse collapse" data-bs-parent="#propertyAccordion">
                    <div className="accordion-body">
                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              {...register("title_en", { required: true })}
                              className={`form-control ${errors.title_en ? 'is-invalid' : ''}`}
                              placeholder={t("Property Title in English")}
                            />
                            <label className="fw-medium">{t("Title (EN)")} *</label>
                            {errors.title_en && (
                              <div className="invalid-feedback">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              {...register("slug_en", { required: true })}
                              className={`form-control ${errors.slug_en ? 'is-invalid' : ''}`}
                              placeholder={t("URL Slug in English")}
                            />
                            <label className="fw-medium">{t("Slug (EN)")} *</label>
                            {errors.slug_en && (
                              <div className="invalid-feedback">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="form-floating">
                            <input
                              {...register("keywords_en", { required: true })}
                              className={`form-control ${errors.keywords_en ? 'is-invalid' : ''}`}
                              placeholder={t("Keywords in English")}
                            />
                            <label className="fw-medium">{t("Keywords (EN)")} *</label>
                            {errors.keywords_en && (
                              <div className="invalid-feedback">{t("This field is required")}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-medium">{t("Description (EN)")} *</label>
                          <div className="border rounded-3 p-3 bg-light">
                            <RichTextEditor
                              value={descriptionEn}
                              onChange={setDescriptionEn}
                              label=""
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Images - Moved to bottom */}
                <div className="accordion-item border-0 shadow-sm mb-3 rounded-3">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-semibold bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#propertyImages">
                      Property Images
                    </button>
                  </h2>
                  <div id="propertyImages" className="accordion-collapse collapse" data-bs-parent="#propertyAccordion">
                    <div className="accordion-body">
                      <div className="mb-4">
                        <label className="form-label fw-medium">{t("Property Images")} *</label>
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="form-control form-control-lg"
                            onChange={handleImageChange}
                            style={{
                              border: '2px dashed #0d6efd',
                              borderRadius: '12px',
                              padding: '20px',
                              backgroundColor: '#f8f9ff',
                              fontSize: '16px',
                              fontWeight: '500'
                            }}
                          />
                          {/* <button
                            type="button"
                            className="btn btn-outline-primary btn-lg"
                            // onClick={() => document.querySelector('input[type="file"]')?.click()}
                            onClick={() => {
                              const fileInput = document.querySelector('input[type="file"]') as HTMLElement;
                              fileInput?.click();
                            }}
                            style={{
                              borderRadius: '12px',
                              fontWeight: '600',
                              minWidth: '150px'
                            }}
                          >
                            <i className="fas fa-plus me-2"></i>
                            {t("Add More")}
                          </button> */}
                        </div>
                        <div className="form-text mb-3">
                          {t("Select multiple images for the property")}
                        </div>

                        {/* Image Previews */}
                        {imagesPreviews.length > 0 && (
                          <div className="row g-3">
                            {imagesPreviews.map((preview) => (
                              <div key={preview.id} className="col-lg-3 col-md-4 col-sm-6">
                                <div
                                  className="position-relative"
                                  style={{
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.3s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                  }}
                                >
                                  <Image
                                    width={40}
                                    height={40}
                                    src={preview.url}
                                    alt="Property preview"
                                    className="w-100"
                                    style={{
                                      height: '200px',
                                      objectFit: 'cover',
                                      borderRadius: '12px'
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle"
                                    onClick={() => removeImage(preview.id)}
                                    style={{
                                      width: '35px',
                                      height: '35px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '16px',
                                      fontWeight: 'bold',
                                      boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
                                      border: 'none',
                                      transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'scale(1.1)';
                                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'scale(1)';
                                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
                                    }}
                                    title={t("Remove image")}
                                  >
                                    ×
                                  </button>
                                  <div
                                    className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-2"
                                    style={{
                                      fontSize: '12px',
                                      fontWeight: '500'
                                    }}
                                  >
                                    {preview.file.name.length > 20
                                      ? preview.file.name.substring(0, 17) + '...'
                                      : preview.file.name}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Empty state */}
                        {imagesPreviews.length === 0 && (
                          <div
                            className="text-center py-5"
                            style={{
                              border: '2px dashed #dee2e6',
                              borderRadius: '12px',
                              backgroundColor: '#f8f9fa'
                            }}
                          >
                            <i
                              className="fas fa-image mb-3"
                              style={{
                                fontSize: '48px',
                                color: '#6c757d'
                              }}
                            ></i>
                            <p className="text-muted mb-0">
                              {t("No images selected yet")}
                            </p>
                            <small className="text-muted">
                              {t("Click 'Add More' or use the file input above to select images")}
                            </small>
                          </div>
                        )}

                        {/* Images counter */}
                        {imagesPreviews.length > 0 && (
                          <div className="mt-3">
                            <div
                              className="badge bg-primary fs-6 px-3 py-2"
                              style={{
                                borderRadius: '8px'
                              }}
                            >
                              {/* {imagesPreviews.length} {imagesPreviews.length === 1 ? t("image selected") : t("images selected")} */}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end gap-3 pt-4 border-top">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn btn-outline-secondary btn-lg px-4 py-2 rounded-3"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg px-4 py-2 rounded-3 shadow-sm"
                >
                  {t("Submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  );
};

export default CreatePropertyPage;
