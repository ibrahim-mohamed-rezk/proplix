"use client";
import Image from "next/image";
import avatar_1 from "@/assets/images/dashboard/avatar_02.jpg";
import { postData } from "@/libs/server/backendServer";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

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
  const t = useTranslations("SignupPage");

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
    toast.info(t("Image removed"));
  };

  const addSocialLink = () => {
    setFormData((prev) => ({
      ...prev,
      social_links: [...prev.social_links, ""],
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index),
    }));
  };

  const updateSocialLink = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      social_links: prev.social_links.map((link, i) =>
        i === index ? value : link
      ),
    }));
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

      await postData("agent/register", formDataToSend);

      toast.success(t("Account created successfully!"));

      // Reset form or redirect user
      // You might want to redirect to login page or dashboard
    } catch (err) {
      console.error("Error creating account:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create account";
      toast.error(t(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-body !pt-[20px] !m-[0px]">
      <div className="position-relative">
        <form onSubmit={handleSubmit}>
          {/* User Avatar Section */}
          <div className="bg-white card-box mb-4">
            <h3 className="mb-4">{t("Create Agent Account")}</h3>

            <div className="user-avatar-setting d-flex align-items-center mb-30">
              <Image
                src={selectedImage || avatar_1}
                alt="User Avatar"
                className="lazy-img user-img"
                width={80}
                height={80}
              />
              <div className="upload-btn position-relative tran3s ms-4 me-3">
                {t("Upload profile photo")}
                <input
                  type="file"
                  id="uploadImg"
                  name="uploadImg"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="delete-btn tran3s"
              >
                {t("Delete")}
              </button>
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
                    onChange={(e) => handleInputChange("name", e.target.value)}
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
                    onChange={(e) => handleInputChange("email", e.target.value)}
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
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder={t("Enter your phone number")}
                  />
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
                      handleInputChange("password_confirmation", e.target.value)
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

            {/* File Uploads */}
            <div className="row">
              <div className="col-sm-6">
                <div className="dash-input-wrapper mb-30">
                  <label htmlFor="id_number">{t("ID Document")}</label>
                  <input
                    type="file"
                    id="id_number"
                    onChange={(e) =>
                      handleFileChange("id_number", e.target.files?.[0] || null)
                    }
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="dash-input-wrapper mb-30">
                  <label htmlFor="trade_licence">{t("Trade License")}</label>
                  <input
                    type="file"
                    id="trade_licence"
                    onChange={(e) =>
                      handleFileChange(
                        "trade_licence",
                        e.target.files?.[0] || null
                      )
                    }
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Links Section */}
          <div className="bg-white card-box mb-4">
            <h4 className="mb-4">{t("Social Media Links")}</h4>
            {formData.social_links.map((link, index) => (
              <div key={index} className="row mb-3">
                <div className="col-10">
                  <div className="dash-input-wrapper">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => updateSocialLink(index, e.target.value)}
                      placeholder={t("Enter social media URL")}
                    />
                  </div>
                </div>
                <div className="col-2">
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="btn btn-danger btn-sm"
                    disabled={formData.social_links.length <= 1}
                  >
                    {t("Remove")}
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addSocialLink}
              className="btn btn-outline-primary btn-sm"
            >
              {t("Add Social Link")}
            </button>
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
                    onChange={(e) => handleInputChange("city", e.target.value)}
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
                    onChange={(e) => handleInputChange("state", e.target.value)}
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
              className="dash-btn-two tran3s me-3"
            >
              {isSubmitting ? t("Creating Account...") : t("Create Account")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
