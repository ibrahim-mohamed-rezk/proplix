"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { postData, getData } from "@/libs/server/backendServer";
import { AxiosHeaders } from "axios";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import RichTextEditor from "@/components/RichTextEditor";
import NiceSelect from "@/ui/NiceSelect";
import { toast } from "react-toastify";

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

const CreatePropertyPage = ({ token }: { token: string }) => {
  const t = useTranslations("properties");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();

  // Tab state - starting with general information
  const [activeTab, setActiveTab] = useState<"general" | "ar" | "en" | "seo">("general");

  const [descriptionEn, setDescriptionEn] = useState<string>("");
  const [descriptionAr, setDescriptionAr] = useState<string>("");
  const [images, setImages] = useState<FileList | null>(null);

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
    formData.append("meta_title[en]", data.meta_title_en);
    formData.append("meta_description[en]", data.meta_description_en);
    formData.append("meta_keywords[en]", data.meta_keywords_en);
    
    // Add Arabic fields
    formData.append("title[ar]", data.title_ar);
    formData.append("description[ar]", descriptionAr);
    formData.append("keywords[ar]", data.keywords_ar);
    formData.append("slug[ar]", data.slug_ar);
    formData.append("meta_title[ar]", data.meta_title_ar);
    formData.append("meta_description[ar]", data.meta_description_ar);
    formData.append("meta_keywords[ar]", data.meta_keywords_ar);

    // Add images
    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append("cover", images[i]);
      }
    }

    try {
      await postData("agent/property_listings", formData, new AxiosHeaders({ Authorization: `Bearer ${token}` }));
      toast.success(t("Property added successfully"));
      router.back();
    } catch (error) {
      console.error("Failed to create property:", error);
      toast.error(t("Failed to add property"));
    }
  };

  const TabButton = ({ label, isActive, onClick }: {
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`dash-btn-two ${isActive ? "active" : ""}`}
    >
      {label}
    </button>
  );

  return (
    <div className="">
      <div className="bg-white card-box">
        <h4 className="dash-title-three">{t("Create Property")}</h4>
        
        {/* Tab Navigation */}
        <div className="dash-input-wrapper mb-30">
          <div className="tab-navigation d-flex gap-2">
            <TabButton
              label={t("General Information")}
              isActive={activeTab === "general"}
              onClick={() => setActiveTab("general")}
            />
            <TabButton
              label={t("Arabic Content")}
              isActive={activeTab === "ar"}
              onClick={() => setActiveTab("ar")}
            />
            <TabButton
              label={t("English Content")}
              isActive={activeTab === "en"}
              onClick={() => setActiveTab("en")}
            />
            <TabButton
              label={t("SEO Settings")}
              isActive={activeTab === "seo"}
              onClick={() => setActiveTab("seo")}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          
          {/* General Information Tab */}
          {activeTab === "general" && (
            <div>
              <div className="row align-items-end">
                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Property Type")}*</label>
                    <NiceSelect
                      className="nice-select"
                      options={[
                        { value: "", text: t("Select Type") },
                        ...propertyTypes?.data?.map((type) => ({
                          value: type.id,
                          text: type.title || type.name || ""
                        }))
                      ]}
                      defaultCurrent={0}
                      onChange={handleTypeChange}
                      name="type_id"
                      placeholder=""
                    />
                    {!selectValues.type_id && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Area")}*</label>
                    <NiceSelect
                      className="nice-select"
                      options={[
                        { value: "", text: t("Select Area") },
                        ...areas?.data?.map((area) => ({
                          value: area.id.toString(),
                          text: `${area.name} / ${area.name}`
                        }))
                      ]}
                      defaultCurrent={0}
                      onChange={handleAreaChange}
                      name="area_id"
                      placeholder=""
                    />
                    {!selectValues.area_id && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Price")}*</label>
                    <input
                      {...register("price", { required: true })}
                      type="number"
                      placeholder={t("Your Price")}
                    />
                    {errors.price && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Down Price")}*</label>
                    <input
                      {...register("down_price", { required: true })}
                      type="number"
                      placeholder={t("Down Price")}
                    />
                    {errors.down_price && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Square Meters")}*</label>
                    <input
                      {...register("sqt", { required: true })}
                      type="number"
                      placeholder={t("Square Meters")}
                    />
                    {errors.sqt && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Bedroom")}*</label>
                    <input
                      {...register("bedroom", { required: true })}
                      type="number"
                      placeholder={t("Number of Bedrooms")}
                    />
                    {errors.bedroom && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Bathroom")}*</label>
                    <input
                      {...register("bathroom", { required: true })}
                      type="number"
                      placeholder={t("Number of Bathrooms")}
                    />
                    {errors.bathroom && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("kitchen")}*</label>
                    <input
                      {...register("kitichen", { required: true })}
                      type="number"
                      placeholder={t("Number of kitichen s")}
                    />
                    {errors.kitichen  && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Status")}*</label>
                    <NiceSelect
                      className="nice-select"
                      options={[
                        { value: "", text: t("Select Status") },
                        { value: "rent", text: t("Rent") },
                        { value: "sale", text: t("Sale") }
                      ]}
                      defaultCurrent={0}
                      onChange={handleStatusChange}
                      name="status"
                      placeholder=""
                    />
                    {!selectValues.status && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Type")}*</label>
                    <NiceSelect
                      className="nice-select"
                      options={[
                        { value: "", text: t("Select Type") },
                        { value: "apartment", text: t("Apartment") },
                        { value: "office", text: t("Office") }
                      ]}
                      defaultCurrent={0}
                      onChange={handleTypeSelectChange}
                      name="type"
                      placeholder=""
                    />
                    {!selectValues.type && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Immediate Delivery")}*</label>
                    <NiceSelect
                      className="nice-select"
                      options={[
                        { value: "", text: t("Select Option") },
                        { value: "yes", text: t("Yes") },
                        { value: "no", text: t("No") }
                      ]}
                      defaultCurrent={0}
                      onChange={handleImmediateDeliveryChange}
                      name="immediate_delivery"
                      placeholder=""
                    />
                    {!selectValues.immediate_delivery && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="dash-input-wrapper mb-30">
                <label htmlFor="">{t("Property Images")}*</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImages(e.target.files)}
                  required
                />
                <small className="form-text text-muted">{t("Select multiple images for the property")}</small>
              </div>
            </div>
          )}

          {/* Arabic Content Tab */}
          {activeTab === "ar" && (
            <div>
              <div className="row align-items-end">
                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Title (AR)")}*</label>
                    <input
                      {...register("title_ar", { required: true })}
                      placeholder={t("Property Title in Arabic")}
                      dir="rtl"
                    />
                    {errors.title_ar && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Slug (AR)")}*</label>
                    <input
                      {...register("slug_ar", { required: true })}
                      placeholder={t("URL Slug in Arabic")}
                      dir="rtl"
                    />
                    {errors.slug_ar && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Keywords (AR)")}*</label>
                    <input
                      {...register("keywords_ar", { required: true })}
                      placeholder={t("Keywords in Arabic")}
                      dir="rtl"
                    />
                    {errors.keywords_ar && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="dash-input-wrapper mb-30">
                <label htmlFor="">{t("Description (AR)")}*</label>
                <RichTextEditor
                  value={descriptionAr}
                  onChange={setDescriptionAr}
                  label=""
                />
              </div>
            </div>
          )}

          {/* English Content Tab */}
          {activeTab === "en" && (
            <div>
              <div className="row align-items-end">
                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Title (EN)")}*</label>
                    <input
                      {...register("title_en", { required: true })}
                      placeholder={t("Property Title in English")}
                    />
                    {errors.title_en && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Slug (EN)")}*</label>
                    <input
                      {...register("slug_en", { required: true })}
                      placeholder={t("URL Slug in English")}
                    />
                    {errors.slug_en && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Keywords (EN)")}*</label>
                    <input
                      {...register("keywords_en", { required: true })}
                      placeholder={t("Keywords in English")}
                    />
                    {errors.keywords_en && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="dash-input-wrapper mb-30">
                <label htmlFor="">{t("Description (EN)")}*</label>
                <RichTextEditor
                  value={descriptionEn}
                  onChange={setDescriptionEn}
                  label=""
                />
              </div>
            </div>
          )}

          {/* SEO Settings Tab */}
          {activeTab === "seo" && (
            <div>
              <h4 className="dash-title-three">{t("English SEO")}</h4>
              <div className="row align-items-end">
                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Meta Title (EN)")}*</label>
                    <input
                      {...register("meta_title_en", { required: true })}
                      placeholder={t("Meta Title in English")}
                    />
                    {errors.meta_title_en && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Meta Keywords (EN)")}*</label>
                    <input
                      {...register("meta_keywords_en", { required: true })}
                      placeholder={t("Meta Keywords in English")}
                    />
                    {errors.meta_keywords_en && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Meta Description (EN)")}*</label>
                    <textarea
                      {...register("meta_description_en", { required: true })}
                      className="size-lg"
                      placeholder={t("Meta Description in English")}
                    />
                    {errors.meta_description_en && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>
              </div>

              <h4 className="dash-title-three">{t("Arabic SEO")}</h4>
              <div className="row align-items-end">
                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Meta Title (AR)")}*</label>
                    <input
                      {...register("meta_title_ar", { required: true })}
                      placeholder={t("Meta Title in Arabic")}
                      dir="rtl"
                    />
                    {errors.meta_title_ar && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Meta Keywords (AR)")}*</label>
                    <input
                      {...register("meta_keywords_ar", { required: true })}
                      placeholder={t("Meta Keywords in Arabic")}
                      dir="rtl"
                    />
                    {errors.meta_keywords_ar && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="">{t("Meta Description (AR)")}*</label>
                    <textarea
                      {...register("meta_description_ar", { required: true })}
                      className="size-lg"
                      placeholder={t("Meta Description in Arabic")}
                      dir="rtl"
                    />
                    {errors.meta_description_ar && (
                      <div className="text-danger">{t("This field is required")}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="button-group d-inline-flex" style={{ gap: '10px' }}>
            <button
              type="button"
              onClick={() => router.back()}
              className="dash-btn-two tran3s me-3 rounded-3"
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              className="dash-btn-one d-flex align-items-center"
              style={{ gap: '10px' }}
            >
              <i className="fa-regular fa-floppy-disk"></i>
              {t("Submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePropertyPage;