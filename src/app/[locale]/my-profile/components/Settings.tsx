"use client";
import { useLocale, useTranslations } from "next-intl";
import { routing, usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { useState } from "react";
import { postData } from "@/libs/server/backendServer";

const Settings = ({ token }: { token: string }) => {
  const t = useTranslations("Profile");
  const locales = routing.locales;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});


  // Function to validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.current_password) {
      newErrors.current_password = t("Current password is required");
    }
    if (!formData.new_password) {
      newErrors.password = t("New password is required");
    } else if (formData.new_password.length < 8) {
      newErrors.password = t("Password must be at least 8 characters");
    }
    if (!formData.new_password_confirmation) {
      newErrors.new_password_confirmation = t("Please confirm your password");
    } else if (formData.new_password !== formData.new_password_confirmation) {
      newErrors.new_password_confirmation = t("Passwords do not match");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const changeLanguage = (l: string) => {
    const paramsString = searchParams.toString();
    const url = paramsString ? `${pathname}?${paramsString}` : pathname;
    router.replace(url, { locale: l });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await postData("change-password-api", formData, {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      });

      toast.success(t("Password changed successfully"));
      // Clear form after successful submission
      setFormData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
      toast.success(t("Password changed successfully"));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.msg || t("An error occurred"));
      } else {
        toast.error(t("An unexpected error occurred"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-wrapper">
      <div className="space-y-6">
        {/* Change Password Section */}
        <div className="password-section">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {t("Change Password")}
          </h4>
          <div className="grid grid-cols-1 gap-[24px]">
            <div className="form-group">
              <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
                {t("Current Password")}*
              </label>
              <input
                type="password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-[8px] text-[#000] border ${
                  errors.current_password ? "border-red-500" : "border-gray-300"
                } focus:outline-none transition-colors`}
                placeholder={t("Enter current password")}
              />
              {errors.current_password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.current_password}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
                {t("New Password")}*
              </label>
              <input
                type="password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-[8px] text-[#000] border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } focus:outline-none transition-colors`}
                placeholder={t("Enter new password")}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="form-group">
              <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
                {t("Confirm New Password")}*
              </label>
              <input
                type="password"
                name="new_password_confirmation"
                value={formData.new_password_confirmation}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-[8px] text-[#000] border ${
                  errors.new_password_confirmation
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:outline-none transition-colors`}
                placeholder={t("Confirm new password")}
              />
              {errors.new_password_confirmation && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.new_password_confirmation}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Language Settings Section */}
        <div className="language-section mt-[30px]">
          <h4 className="text-xl font-medium text-gray-900 mb-4">
            {t("Language Settings")}
          </h4>
          <div className="form-group">
            <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
              {t("Site Language")}*
            </label>
            <select
              value={locale}
              onChange={(e) => changeLanguage(e.target.value)}
              className="w-[200px] px-4 py-3 rounded-[8px] text-[#000] border border-gray-300 focus:outline-none transition-colors"
            >
              {locales.map((locale) => (
                <option key={locale} value={locale}>
                  {locale === "en"
                    ? "English"
                    : locale === "ar"
                    ? "العربيه"
                    : locale}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-[30px]">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-[120px] h-[48px] bg-[#FF6625] text-white rounded-[8px] hover:bg-blue-700 transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? t("Saving...") : t("Save Changes")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
