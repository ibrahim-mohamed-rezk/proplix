import NiceSelect from "@/ui/NiceSelect";
import Image from "next/image";
import locationImage from "@/assets/images/dashboard/icon/icon_16.svg";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

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
  social_links: SocialLink[]; // Updated to match the API response
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

interface AddressAndLocationProps {
  profileData: ProfileData | null;
  onLocationChange: (locationData: LocationData) => void;
  onUpdateProfile: () => void;
  isUpdating?: boolean;
  canSubmit?: boolean; // Add this prop to control submit button state
}

const AddressAndLocation = ({
  profileData,
  onLocationChange,
  onUpdateProfile,
  isUpdating = false,
  canSubmit = true // Default to true for backward compatibility
}: AddressAndLocationProps) => {
  const [locationData, setLocationData] = useState<LocationData>({
    address: '',
    country: '',
    city: '',
    zip_code: '',
    state: '',
    map_location: '',
    current_password: ''
  });
  const t = useTranslations('ProfileBody');

  // Initialize location data when profileData changes (only once)
  useEffect(() => {
    if (profileData && locationData.address === '' && locationData.country === '' && locationData.city === '') {
      const initialData = {
        address: profileData.address || '',
        country: profileData.country || '',
        city: profileData.city || '',
        zip_code: profileData.zip_code || '',
        state: profileData.state || '',
        map_location: profileData.address || '',
        current_password: ''
      };
      setLocationData(initialData);
      onLocationChange(initialData);
    }
  }, [profileData, onLocationChange]); // Added onLocationChange to dependencies

  const handleInputChange = (field: keyof LocationData, value: string) => {
    const updatedData = {
      ...locationData,
      [field]: value
    };
    setLocationData(updatedData);
    onLocationChange(updatedData);
  };

  const handleCancel = () => {
    if (profileData) {
      const resetData = {
        address: profileData.address || '',
        country: profileData.country || '',
        city: profileData.city || '',
        zip_code: profileData.zip_code || '',
        state: profileData.state || '',
        map_location: profileData.address || '',
        current_password: '' // Reset password field
      };
      setLocationData(resetData);
      onLocationChange(resetData);
    }
  };

  return (
    <div className="bg-white card-box mt-40">
      <h4 className="dash-title-three">{t("Address & Location")}</h4>
      <div className="row">
        <div className="col-12">
          <div className="dash-input-wrapper mb-25">
            <label htmlFor="address">{t("Address*")}</label>
            <input
              type="text"
              id="address"
              value={locationData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="19 Yawkey Way"
              disabled={isUpdating}
            />
          </div>
        </div>

        {/* Country */}
        <div className="col-lg-3">
          <div className="dash-input-wrapper mb-25">
            <label htmlFor="country">{t("Country*")}</label>
            <input
              type="text"
              id="country"
              value={locationData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="Select Country"
              disabled={isUpdating}
            />
          </div>
        </div>

        {/* City */}
        <div className="col-lg-3">
          <div className="dash-input-wrapper mb-25">
            <label htmlFor="city">{t("City*")}</label>
            <input
              type="text"
              id="city"
              value={locationData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Select City"
              disabled={isUpdating}
            />
          </div>
        </div>

        {/* Zip Code */}
        <div className="col-lg-3">
          <div className="dash-input-wrapper mb-25">
            <label htmlFor="zip_code">{t("Zip Code*")}</label>
            <input
              type="text"
              id="zip_code"
              value={locationData.zip_code}
              onChange={(e) => handleInputChange('zip_code', e.target.value)}
              placeholder="1708"
              disabled={isUpdating}
            />
          </div>
        </div>

        {/* State */}
        <div className="col-lg-3">
          <div className="dash-input-wrapper mb-25">
            <label htmlFor="state">{t("State*")}</label>
            <input
              type="text"
              id="state"
              value={locationData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="Select State"
              disabled={isUpdating}
            />
          </div>
        </div>
      </div>

      {/* Map Location */}
      <div className="col-12">
        <div className="dash-input-wrapper mb-25">
          <label htmlFor="map_location">{t("Map Location*")}</label>
          <div className="position-relative">
            <input
              type="text"
              id="map_location"
              value={locationData.map_location}
              onChange={(e) => handleInputChange('map_location', e.target.value)}
              placeholder="XC23+6XC, Moiran, N105"
              disabled={isUpdating}
            />
            <button
              type="button"
              className="location-pin tran3s"
              disabled={isUpdating}
              title="Select location on map"
            >
              <Image src={locationImage} alt="Location Pin" className="lazy-img m-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* Current Password Field */}
      <div className="col-12">
        <div className="dash-input-wrapper mb-25">
          <label htmlFor="current_password">{t("Current Password*")}</label>
          <input
            type="password"
            id="current_password"
            value={locationData.current_password}
            onChange={(e) => handleInputChange('current_password', e.target.value)}
            placeholder={t("Enter your current password")}
            disabled={isUpdating}
            className={!canSubmit && locationData.current_password === '' ? 'is-invalid' : ''}
            autoComplete="current-password"
          />
          {!canSubmit && locationData.current_password === '' && (
            <div className="invalid-feedback">
              {t(" Password is required to save changes")}
            </div>
          )}
          <div className="text-muted small mt-1">
            <em>{t("Required to verify your identity before saving changes")}</em>
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="button-group d-inline-flex align-items-center mb-10  ">
        <button
          type="button"
          className={`dash-btn-two tran3s me-3 ${!canSubmit ? 'disabled' : ''}`}
          onClick={onUpdateProfile}
          disabled={isUpdating || !canSubmit}
          title={!canSubmit ? 'Please enter your current password' : 'Save profile changes'}
        >
          {isUpdating ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {t("Updating")}
            </>
          ) : (
            t('Save Changes')
          )}
        </button>
        <button
          type="button"
          className="dash-cancel-btn tran3s mx-5"
          onClick={handleCancel}
          disabled={isUpdating}
          title="Reset to original values"
        >
          {t("Cancel")}
        </button>
      </div>

      {/* Password requirement notice
      {
        !canSubmit && (
          <div className="mt-2">
            <small className="text-muted">
              <em>{t("* Please enter your current password to save changes")}</em>
            </small>
          </div>
        )
      } */}
    </div >
  );
}

export default AddressAndLocation;