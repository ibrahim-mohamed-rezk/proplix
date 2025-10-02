"use client";
import Image from "next/image";
import avatar_1 from "@/assets/images/dashboard/avatar_02.jpg";
import { postData } from "@/libs/server/backendServer";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import Wrapper from "@/layouts/Wrapper";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import axios from "axios";
import { validatePhoneNumber } from "@/utils/phoneValidation";

interface SignupFormData {
  // User basic info
  name: string;
  email: string;
  phone: string;
  website: string;
  descriptions: string;
  password: string;
  password_confirmation: string;

  // Location data
  address: string;
  country: string;
  city: string;
  zip_code: string;
  state: string;

  // Social links
  social_links: string[];

  // Files
  avatar: File | null;
  id_number: File | null;
  trade_licence: File | null;
}

const SignupPage = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    phone: "",
    website: "",
    descriptions: "",
    password: "",
    password_confirmation: "",
    address: "",
    country: "",
    city: "",
    zip_code: "",
    state: "",
    social_links: [""],
    avatar: null,
    id_number: null,
    trade_licence: null,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const t = useTranslations("SignupPage");
  const locale = useLocale();

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Validate phone number in real-time
    if (field === "phone") {
      const validation = validatePhoneNumber(value, true);
      if (!validation.isValid) {
        setPhoneError(validation.error || "Invalid phone number");
      } else {
        setPhoneError(null);
      }
    }
  };

  const handleSocialLinksChange = (links: string[]) => {
    setFormData((prev) => ({
      ...prev,
      social_links: links,
    }));
  };

  const handleFileChange = (
    field: "avatar" | "id_number" | "trade_licence",
    file: File | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("Image size should be less than 5MB"));
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(t("Please select a valid image file"));
        return;
      }

      handleFileChange("avatar", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        toast.success(t("Profile image selected"));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    handleFileChange("avatar", null);
    // Reset the file input
    const fileInput = document.getElementById("uploadImg") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
    toast.info(t("Image removed"));
  };

  const handleDocumentUpload = (
    field: "id_number" | "trade_licence",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("File size should be less than 10MB"));
        return;
      }

      handleFileChange(field, file);
      toast.success(t("Document uploaded successfully"));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error(t("Name is required"));
      return false;
    }
    if (!formData.email.trim()) {
      toast.error(t("Email is required"));
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error(t("Phone number is required"));
      return false;
    }
    // Validate phone number format
    const phoneValidation = validatePhoneNumber(formData.phone, true);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error || "Invalid phone number");
      toast.error(phoneValidation.error || "Please enter a valid phone number");
      return false;
    }
    if (!formData.password.trim()) {
      toast.error(t("Password is required"));
      return false;
    }
    if (formData.password !== formData.password_confirmation) {
      toast.error(t("Passwords do not match"));
      return false;
    }
    if (formData.password.length < 8) {
      toast.error(t("Password must be at least 8 characters"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const formDataToSend = new FormData();

      // Append basic fields (matching API structure)
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("website", formData.website);
      formDataToSend.append("descriptions", formData.descriptions);
      formDataToSend.append("password", formData.password);
      formDataToSend.append(
        "password_confirmation",
        formData.password_confirmation
      );

      // Append location data (matching API structure)
      formDataToSend.append("address", formData.address);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("zip_code", formData.zip_code);
      formDataToSend.append("state", formData.state);

      // Append social links as JSON string (matching API structure)
      const filteredSocialLinks = formData.social_links.filter(
        (link) => link.trim() !== ""
      );
      formDataToSend.append(
        "social_links",
        JSON.stringify(filteredSocialLinks)
      );

      // Append files
      if (formData.avatar) {
        formDataToSend.append("avatar", formData.avatar);
      }
      if (formData.id_number) {
        formDataToSend.append("id_number", formData.id_number);
      }
      if (formData.trade_licence) {
        formDataToSend.append("trade_licence", formData.trade_licence);
      }

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      const response = await postData("agent/register", formDataToSend, {
        "Content-Type": "multipart/form-data",
        lang: locale,
      });

      await axios.post(
        "/api/auth/login",
        {
          token: response.token,
          user: JSON.stringify(response.data),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(t("Account created successfully!"));

      window.location.href = `/${locale}/dashboard/profile`;

      // Reset form or redirect user
      // You might want to redirect to login page or dashboard
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.msg || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Wrapper>
      <HeaderOne style={true} />
      <div className="dashboard-body !pt-[20px] !m-[0px] !mt-[120px]">
        <div className="position-relative">
          <form onSubmit={handleSubmit}>
            {/* User Avatar Section */}
            <div className="bg-white card-box mb-4">
              <h3 className="mb-4">{t("Create Agent Account")}</h3>

              <div className="user-avatar-setting d-flex align-items-center mb-30">
                {/* Avatar Preview */}
                <div className="avatar-preview-wrapper position-relative">
                  {selectedImage ? (
                    <div className="avatar-container position-relative">
                      <Image
                        src={selectedImage}
                        alt="User Avatar"
                        className="lazy-img user-img rounded-circle shadow-sm"
                        width={100}
                        height={100}
                        style={{ objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="remove-avatar-btn position-absolute top-0 end-0 bg-danger text-white border-0 rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "30px",
                          height: "30px",
                          transform: "translate(25%, -25%)",
                          fontSize: "14px",
                        }}
                        title={t("Remove image")}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div
                      className="avatar-placeholder d-flex align-items-center justify-content-center bg-light rounded-circle border-2 border-dashed"
                      style={{ width: "100px", height: "100px" }}
                    >
                      <svg
                        width="40"
                        height="40"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                        className="text-muted"
                      >
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="upload-controls ms-4">
                  <div className="upload-btn-wrapper position-relative">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                      onClick={() =>
                        document.getElementById("uploadImg")?.click()
                      }
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                      </svg>
                      {selectedImage ? t("Change Photo") : t("Upload Photo")}
                    </button>
                    <input
                      type="file"
                      id="uploadImg"
                      name="uploadImg"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="position-absolute opacity-0"
                      style={{ width: "1px", height: "1px" }}
                    />
                  </div>
                  {selectedImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="btn btn-outline-danger btn-sm mt-2 d-flex align-items-center gap-2"
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                      </svg>
                      {t("Remove")}
                    </button>
                  )}
                  <div className="upload-hint text-muted small mt-2">
                    {t("Max file size: 5MB JPG, PNG formats only")}
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="row">
                <div className="col-12">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="name">{t("Full Name")}*</label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder={t("Enter your full name")}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-sm-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="email">{t("Email Address")}*</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder={t("Enter your email")}
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="phone">{t("Phone Number")}</label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="+1 (555) 123-4567"
                      className={phoneError ? "is-invalid" : ""}
                    />
                    {phoneError && (
                      <div className="invalid-feedback d-block">
                        {phoneError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-sm-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="password">{t("Password")}*</label>
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder={t("Enter your password")}
                      required
                      minLength={8}
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="password_confirmation">
                      {t("Confirm Password")}*
                    </label>
                    <input
                      type="password"
                      id="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={(e) =>
                        handleInputChange(
                          "password_confirmation",
                          e.target.value
                        )
                      }
                      placeholder={t("Confirm your password")}
                      required
                      minLength={8}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="website">{t("Website")}</label>
                    <input
                      type="url"
                      id="website"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      placeholder={t("Enter your website URL")}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="descriptions">{t("Description")}</label>
                    <textarea
                      id="descriptions"
                      value={formData.descriptions}
                      onChange={(e) =>
                        handleInputChange("descriptions", e.target.value)
                      }
                      placeholder={t("Tell us about yourself")}
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced File Uploads */}
              <div className="row">
                <div className="col-sm-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="id_number">{t("ID Document")}</label>
                    <div className="file-upload-wrapper">
                      <div className="file-upload-area border-2 border-dashed rounded p-4 text-center position-relative">
                        <input
                          type="file"
                          id="id_number"
                          onChange={(e) => handleDocumentUpload("id_number", e)}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="position-absolute w-100 h-100 opacity-0"
                          style={{ cursor: "pointer" }}
                        />
                        <div className="upload-content">
                          <svg
                            width="48"
                            height="48"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            className="text-muted mb-2"
                          >
                            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
                          </svg>
                          <div className="upload-text">
                            {formData.id_number ? (
                              <div>
                                <div className="text-success fw-bold">
                                  {formData.id_number.name}
                                </div>
                                <small className="text-muted">
                                  {t("Click to change")}
                                </small>
                              </div>
                            ) : (
                              <div>
                                <div className="fw-bold">
                                  {t("Upload ID Document")}
                                </div>
                                <small className="text-muted">
                                  {t("PDF, JPG, PNG (Max 10MB)")}
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="trade_licence">{t("Trade License")}</label>
                    <div className="file-upload-wrapper">
                      <div className="file-upload-area border-2 border-dashed rounded p-4 text-center position-relative">
                        <input
                          type="file"
                          id="trade_licence"
                          onChange={(e) =>
                            handleDocumentUpload("trade_licence", e)
                          }
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="position-absolute w-100 h-100 opacity-0"
                          style={{ cursor: "pointer" }}
                        />
                        <div className="upload-content">
                          <svg
                            width="48"
                            height="48"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            className="text-muted mb-2"
                          >
                            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
                          </svg>
                          <div className="upload-text">
                            {formData.trade_licence ? (
                              <div>
                                <div className="text-success fw-bold">
                                  {formData.trade_licence.name}
                                </div>
                                <small className="text-muted">
                                  {t("Click to change")}
                                </small>
                              </div>
                            ) : (
                              <div>
                                <div className="fw-bold">
                                  {t("Upload Trade License")}
                                </div>
                                <small className="text-muted">
                                  {t("PDF, JPG, PNG (Max 10MB)")}
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address and Location Section */}
            <div className="bg-white card-box mb-4">
              <h4 className="mb-4">{t("Address & Location")}</h4>

              <div className="row">
                <div className="col-12">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="address">{t("Address")}</label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder={t("Enter your address")}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-sm-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="country">{t("Country")}</label>
                    <input
                      type="text"
                      id="country"
                      value={formData.country}
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
                      placeholder={t("Enter your country")}
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="city">{t("City")}</label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      placeholder={t("Enter your city")}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-sm-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="state">{t("State/Province")}</label>
                    <input
                      type="text"
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      placeholder={t("Enter your state")}
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="dash-input-wrapper mb-30">
                    <label htmlFor="zip_code">{t("ZIP Code")}</label>
                    <input
                      type="text"
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) =>
                        handleInputChange("zip_code", e.target.value)
                      }
                      placeholder={t("Enter your ZIP code")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="button-group d-inline-flex align-items-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="dash-btn-two tran3s me-3 d-flex align-items-center gap-2"
              >
                {isSubmitting && (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                )}
                {isSubmitting ? t("Creating Account...") : t("Create Account")}
              </button>
            </div>
          </form>
        </div>
      </div>
      <FooterOne />

      <style jsx>{`
        .avatar-container {
          transition: all 0.3s ease;
        }

        .avatar-container:hover {
          transform: scale(1.05);
        }

        .remove-avatar-btn {
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .remove-avatar-btn:hover {
          background-color: #dc3545 !important;
          transform: translate(25%, -25%) scale(1.1);
        }

        .avatar-placeholder {
          transition: all 0.3s ease;
          border-color: #dee2e6 !important;
        }

        .avatar-placeholder:hover {
          border-color: #007bff !important;
          background-color: #f8f9fa !important;
        }

        .file-upload-area {
          transition: all 0.3s ease;
          border-color: #dee2e6 !important;
          background-color: #f8f9fa;
        }

        .file-upload-area:hover {
          border-color: #007bff !important;
          background-color: #e3f2fd;
        }

        .file-upload-area:hover .upload-content svg {
          color: #007bff !important;
        }

        .upload-btn-wrapper .btn {
          transition: all 0.3s ease;
        }

        .upload-btn-wrapper .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .dash-btn-two:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
        }
      `}</style>
    </Wrapper>
  );
};

export default SignupPage;
