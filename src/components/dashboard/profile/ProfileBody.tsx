"use client";
import DashboardHeaderTwo from "@/layouts/headers/dashboard/DashboardHeaderTwo";
import Image from "next/image";
import UserAvatarSetting from "./UserAvatarSetting";
import AddressAndLocation from "./AddressAndLocation";
import Link from "next/link";
import SocialMediaLink from "./SocialMediaLink";
import avatar_1 from "@/assets/images/loader.gif";
import { deleteData, getData, postData } from "@/libs/server/backendServer";
import { useEffect, useState, useCallback } from "react"; // Added useCallback import
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { validatePhoneNumber } from "@/utils/phoneValidation";

interface SocialLink {
  id: number;
  user_id: number;
  link: string;
  created_at: string;
  updated_at: string;
}

interface ProfileData {
  country: string | null;
  city: string | null;
  address: string | null;
  zip_code: string | null;
  state: string | null;
  social_links: SocialLink[]; // Updated type
  id: number;
  name: string;
  email: string;
  phone: string;
  second_phone: string;
  parent_id: string | null;
  avatar: string;
  subscription: string;
  provider_id: string | null;
  email_verified_at: string | null;
  role: string;
  modules: any[];
  website?: string;
  descriptions?: string;
  trade_licence?: string;
  id_number?: string;
}

interface LocationData {
  address: string;
  country: string;
  city: string;
  zip_code: string;
  state: string;
  map_location: string;
  current_password: string;
}

const ProfileBody = ({ token }: { token: string }) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentSocialLinks, setCurrentSocialLinks] = useState<string[]>([]);
  const [currentLocationData, setCurrentLocationData] = useState<LocationData>({
    address: "",
    country: "",
    city: "",
    zip_code: "",
    state: "",
    map_location: "",
    current_password: "",
  });
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const t = useTranslations("ProfileBody");

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Use useCallback to memoize handler functions and prevent re-renders
  const handleSocialLinksChange = useCallback((links: string[]) => {
    setCurrentSocialLinks(links);
  }, []);

  const handleLocationChange = useCallback((locationData: LocationData) => {
    setCurrentLocationData(locationData);
  }, []);

  const handleUserDataChange = useCallback((userData: any) => {
    setCurrentUserData(userData);
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const headers = getAuthHeaders();
        const response = await getData("agent/profile", {}, headers);
        const data = response.data.data;

        setProfileData(data);

        // Extract social links from the API response
        const socialLinksArray = data.social_links
          ? data.social_links.map((item: SocialLink) => item.link)
          : [];
        setCurrentSocialLinks(socialLinksArray);

        setCurrentLocationData({
          address: data.address || "",
          country: data.country || "",
          city: data.city || "",
          zip_code: data.zip_code || "",
          state: data.state || "",
          map_location: data.address || "",
          current_password: "", // Always start empty
        });
      } catch (err) {
        console.error("Error fetching profile data:", err);
        toast.error(t("Failed to load profile data"));
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [token]); // Added token as dependency

  const validateProfileData = () => {
    // Check if current password is provided
    if (!currentLocationData.current_password.trim()) {
      toast.error(t("Current password is required to update profile"));
      return false;
    }

    // Validate user data if available
    if (currentUserData) {
      // Check required fields
      if (!currentUserData.username?.trim()) {
        toast.error(t("Username is required"));
        return false;
      }

      if (!currentUserData.email?.trim()) {
        toast.error(t("Email is required"));
        return false;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(currentUserData.email)) {
        toast.error(t("Please enter a valid email address"));
        return false;
      }

      // Validate phone number if provided
      if (currentUserData.phone?.trim()) {
        const phoneValidation = validatePhoneNumber(
          currentUserData.phone,
          true
        );
        if (!phoneValidation.isValid) {
          toast.error(
            phoneValidation.error || t("Please enter a valid phone number")
          );
          return false;
        }
      }

      // Validate second phone if provided
      if (currentUserData.secondPhone?.trim()) {
        const secondPhoneValidation = validatePhoneNumber(
          currentUserData.secondPhone,
          false
        );
        if (!secondPhoneValidation.isValid) {
          toast.error(
            secondPhoneValidation.error ||
              t("Please enter a valid second phone number")
          );
          return false;
        }
      }

      if (!currentUserData.position?.trim()) {
        toast.error(t("Position is required"));
        return false;
      }

      if (!currentUserData.website?.trim()) {
        toast.error(t("Website is required"));
        return false;
      }

      // Validate website URL format
      const websiteRegex = /^https?:\/\/.+/;
      if (!websiteRegex.test(currentUserData.website)) {
        toast.error(
          t(
            "Please enter a valid website URL (starting with http:// or https://)"
          )
        );
        return false;
      }

      if (!currentUserData.descriptions?.trim()) {
        toast.error(t("About description is required"));
        return false;
      }
    }

    // Validate location data
    if (!currentLocationData.country?.trim()) {
      toast.error(t("Country is required"));
      return false;
    }

    if (!currentLocationData.city?.trim()) {
      toast.error(t("City is required"));
      return false;
    }

    if (!currentLocationData.address?.trim()) {
      toast.error(t("Address is required"));
      return false;
    }

    return true;
  };

  const handleUpdateProfile = async () => {
    // Validate all inputs before proceeding
    if (!validateProfileData()) {
      return;
    }

    try {
      setUpdating(true);

      const headers = getAuthHeaders();
      const formDataToSend = new FormData();

      // Append basic text fields (only if they exist in currentUserData)
      if (currentUserData) {
        if (currentUserData.username) {
          formDataToSend.append("name", currentUserData.username);
        }
        if (currentUserData.email)
          formDataToSend.append("email", currentUserData.email);
        if (currentUserData.phone)
          formDataToSend.append("phone", currentUserData.phone);
        if (currentUserData.secondPhone)
          formDataToSend.append("second_phone", currentUserData.secondPhone);
        if (currentUserData.position)
          formDataToSend.append("role", currentUserData.position);
        if (currentUserData.website)
          formDataToSend.append("website", currentUserData.website);
        if (currentUserData.descriptions)
          formDataToSend.append("descriptions", currentUserData.descriptions);

        // Fix: Append the actual files, not field names as strings
        if (currentUserData.idFile && currentUserData.idFile instanceof File) {
          formDataToSend.append("id_number", currentUserData.idFile);
        }
        if (
          currentUserData.tradeLicence &&
          currentUserData.tradeLicence instanceof File
        ) {
          formDataToSend.append("trade_licence", currentUserData.tradeLicence);
        }
      }

      // Append location data from current state
      formDataToSend.append("country", currentLocationData.country || "");
      formDataToSend.append("city", currentLocationData.city || "");
      formDataToSend.append("zip_code", currentLocationData.zip_code || "");
      formDataToSend.append("state", currentLocationData.state || "");
      formDataToSend.append("address", currentLocationData.address || "");

      // Append current password (required)
      formDataToSend.append(
        "current_password",
        currentLocationData.current_password
      );

      // Handle social media links
      currentSocialLinks.forEach((link: string, index: number) => {
        formDataToSend.append(`links[${index}]`, link || "");
      });

      // If the user has selected a new image, append it as well
      if (selectedImage) {
        const fileInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        if (fileInput?.files?.[0]) {
          formDataToSend.append("avatar", fileInput.files[0]);
        }
      }

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      // Make the request with FormData
      const response = await postData(
        "agent/profile/update",
        formDataToSend,
        headers
      );

      // Update local state with new data
      const updatedData = response.data || response;
      if (response.status === 401 || response.status === 422) {
        toast.error(response.msg);
        return;
      }
      setProfileData(updatedData);

      // Update social links from the response
      if (updatedData.social_links) {
        const socialLinksArray = updatedData.social_links.map(
          (item: SocialLink) => item.link
        );
        setCurrentSocialLinks(socialLinksArray);
      }

      toast.success(t("Profile updated successfully!"));

      // Clear the password field after successful update
      setCurrentLocationData((prev) => ({
        ...prev,
        current_password: "",
      }));
    } catch (err: any) {
      console.error("Error updating profile:", err);

      // Handle validation errors with specific field messages
      if (err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages: string[] = [];

        // Extract error messages for each field
        Object.keys(errors).forEach((field) => {
          if (Array.isArray(errors[field])) {
            errorMessages.push(...errors[field]);
          } else {
            errorMessages.push(errors[field]);
          }
        });

        // Show the first error message
        if (errorMessages.length > 0) {
          toast.error(errorMessages[0]);
        } else {
          toast.error(t("Validation error occurred"));
        }
      } else if (err?.response?.data?.message) {
        // Handle general error messages
        toast.error(err.response.data.message);
      } else if (err?.message) {
        // Handle other error types
        toast.error(err.message);
      } else {
        // Fallback error message
        toast.error(t("Failed to update profile"));
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    toast.info(t("Image removed"));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        toast.success(t("New image selected"));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-body">
        <div className="position-relative">
          <div className=" text-center p-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">{t("Loading...")}</span>
            </div>
            {/* <p className="mt-3">Loading profile data...</p> */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-body">
      <div className="position-relative">
        <DashboardHeaderTwo title="Account Settings" />
        <div className="bg-white card-box">
          <div className="user-avatar-setting d-flex align-items-center mb-30">
            <Image
              src={selectedImage || profileData?.avatar || avatar_1}
              alt="User Avatar"
              className="lazy-img user-img"
              width={80}
              height={80}
            />
            <div className="upload-btn position-relative tran3s ms-4 me-3">
              {t("Upload new photo")}
              <input
                type="file"
                id="uploadImg"
                name="uploadImg"
                onChange={handleImageChange}
              />
            </div>
            <button onClick={handleRemoveImage} className="delete-btn tran3s">
              {t("Delete")}
            </button>
          </div>
          <UserAvatarSetting
            profileData={profileData}
            onUserDataChange={handleUserDataChange}
            isUpdating={updating}
          />
        </div>

        <SocialMediaLink
          socialLinks={currentSocialLinks}
          onLinksChange={handleSocialLinksChange}
          isUpdating={updating}
        />

        <AddressAndLocation
          profileData={profileData}
          onLocationChange={handleLocationChange}
          onUpdateProfile={handleUpdateProfile}
          isUpdating={updating}
        />
      </div>
    </div>
  );
};

export default ProfileBody;
