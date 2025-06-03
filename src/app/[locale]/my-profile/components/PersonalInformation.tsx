"use client";

import { UserTypes } from "@/libs/types/types";
import axios from "axios";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { postData } from "@/libs/server/backendServer";

const PersonalInformation = ({
  user,
  token,
}: {
  user: UserTypes;
  token: string;
}) => {
  const t = useTranslations("Profile");
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [userData, setUserData] = useState<UserTypes>({
    ...user,
    image: null,
    avatar: null,
  });
  const [originalPhone, setOriginalPhone] = useState(user.phone);
  const locale = useLocale();

  // get countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("/api/countries");
        setCountries(response.data);
      } catch (error) {
        toast.error(t("errors.failedToLoadCountries"));
      }
    };

    fetchCountries();
  }, [t]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSendVerificationCode = async () => {
    if (!userData.phone) {
      toast.error(t("errors.enterPhoneNumber"));
      return;
    }

    setIsVerifying(true);
    try {
      await postData(
        "send-code-api",
        { phone: userData.phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setShowOtpInput(true);
      toast.success(t("errors.verificationCodeSent"));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || t("errors.failedToSendCode")
        );
      } else {
        toast.error(t("errors.unexpectedError"));
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const validateForm = () => {
    if (!userData.name?.trim()) {
      toast.error(t("errors.nameRequired"));
      return false;
    }
    if (!userData.email?.trim()) {
      toast.error(t("errors.emailRequired"));
      return false;
    }
    if (!userData.phone?.trim()) {
      toast.error(t("errors.phoneRequired"));
      return false;
    }
    if (userData.phone !== originalPhone && !showOtpInput) {
      toast.error(t("errors.verifyNewPhone"));
      return false;
    }
    if (!userData.country?.trim()) {
      toast.error(t("errors.countryRequired"));
      return false;
    }
    if (!userData.city?.trim()) {
      toast.error(t("errors.cityRequired"));
      return false;
    }
    if (!userData.address?.trim()) {
      toast.error(t("errors.addressRequired"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await postData("update-profile-api", userData, {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        locale: locale,
      });

      // Store updated user data in cookies
      Cookies.set("user", JSON.stringify(response.data), {
        expires: 7, // expires in 7 days
        path: "/", // cookie is available for all paths
        secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS in production
        sameSite: "strict", // protect against CSRF
      });

      toast.success(t("errors.profileUpdated"));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || t("errors.anErrorOccurred")
        );
      } else {
        toast.error(t("errors.unexpectedError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="personal-info-wrapper">
      <div className="section-title mb-4">
        <h3 className="text-2xl font-semibold text-gray-900">
          {t("personalInformation")}
        </h3>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group mb-[24px]">
            <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
              {t("name")}*
            </label>
            <input
              type="text"
              name="name"
              value={userData?.name || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-[8px] text-[#000] border border-gray-300 focus:outline-none transition-colors"
              placeholder={t("enterFullName")}
            />
          </div>

          <div className="form-group mb-[24px]">
            <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
              {t("phoneNumber")}*
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex gap-4">
                <input
                  type="tel"
                  name="phone"
                  value={userData?.phone || ""}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 rounded-[8px] border border-gray-300 focus:outline-none transition-colors"
                  placeholder={t("enterPhoneNumber")}
                />
                {userData.phone !== originalPhone && (
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={isVerifying}
                    className="px-4 py-3 bg-blue-600 text-white rounded-[8px] bg-[#00B266] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? t("sending") : t("verify")}
                  </button>
                )}
              </div>
              {showOtpInput && (
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={userData.code || ""}
                    onChange={(e) =>
                      setUserData({ ...userData, code: e.target.value })
                    }
                    className="flex-1 px-4 py-3 rounded-[8px] border border-gray-300 focus:outline-none transition-colors"
                    placeholder={t("enterVerificationCode")}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="form-group mb-[24px]">
            <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
              {t("email")}*
            </label>
            <input
              type="email"
              name="email"
              value={userData?.email || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-[8px] text-[#000] border border-gray-300 focus:outline-none transition-colors"
              placeholder={t("enterEmail")}
            />
          </div>

          <div className="form-group mb-[24px]">
            <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
              {t("country")}*
            </label>
            <select
              name="country"
              value={userData?.country || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-[8px] text-[#000] border border-gray-300 focus:outline-none transition-colors"
            >
              <option value="">{t("selectCountry")}</option>
              {countries.map((country: any) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group mb-[24px]">
            <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
              {t("city")}*
            </label>
            <input
              type="text"
              name="city"
              value={userData?.city || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-[8px] text-[#000] border border-gray-300 focus:outline-none transition-colors"
              placeholder={t("enterCity")}
            />
          </div>

          <div className="form-group mb-[24px] md:col-span-2">
            <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
              {t("address")}*
            </label>
            <input
              type="text"
              name="address"
              value={userData?.address || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-[8px] text-[#000] border border-gray-300 focus:outline-none transition-colors"
              placeholder={t("enterAddress")}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-[120px] h-[48px] bg-[#FF6625] text-white rounded-[8px] hover:bg-[#FF6625]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t("saving") : t("save")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInformation;
