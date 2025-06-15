"use client"
import DashboardHeaderTwo from "@/layouts/headers/dashboard/DashboardHeaderTwo"
import Link from "next/link"
import { getData, postData } from "@/libs/server/backendServer"
import { useEffect, useState } from "react"
import { toast } from "react-toastify";
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"

interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

const AccountSettingBody = ({ token }: { token: string }) => {
  const t = useTranslations('account-settings');
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const locale = useLocale();
  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const headers = getAuthHeaders();
        const response = await getData('agent/profile', {}, headers);
        console.log(response);

        // Extract only the needed fields from the API response
        const data = response.data.data || response;
        const initialData = {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || ''
        };
        setProfileData(initialData);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Failed to load profile data");
        toast.error(t("Failed to load profile data"));
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't submit if password is entered but empty
    if (password.trim() === '') {
      toast.error(t('Please enter your current password to save changes'));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Create FormData
      const formData = new FormData();
      formData.append('name', profileData.name || '');
      formData.append('email', profileData.email || '');
      formData.append('phone', profileData.phone || '');
      formData.append('current_password', password);

      const headers = getAuthHeaders();

      // Send POST request to profile/update
      const response = await postData('agent/profile/update', formData, headers);


      if (response.status === true) {
        toast.success(t('Profile updated successfully!'));
        setPassword(''); // Clear password field after successful update

        // Update local state with new data if needed
        if (response.data) {
          setProfileData({
            name: response.data.name || '',
            email: response.data.email || '',
            phone: response.data.phone || ''
          });
        }
      } else {
        const errorMessage = response.msg || 'Failed to update profile';
        setError(t(errorMessage));
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = "Failed to update profile";
      setError(errorMessage);
      toast.error(t(errorMessage));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-body">
        <div className="position-relative">
          <DashboardHeaderTwo title="Account Settings" />
          <div className="bg-white card-box">
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">{t("Loading...")}</span>
              </div>
              <p className="mt-2">{t("Loading profile data")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-body">
        <div className="position-relative">
          <DashboardHeaderTwo title="Account Settings" />
          <div className="bg-white card-box">
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle"></i> {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-body">
      <div className="position-relative">
        <DashboardHeaderTwo title="Account Settings" />
        <h2 className="main-title d-block d-lg-none">{t("Account Settings")}</h2>
        <div className="bg-white card-box">
          <h4 className="dash-title-three">{t("Edit & Update")}</h4>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-12">
                <div className="dash-input-wrapper mb-20">
                  <label htmlFor="name">{t("Full Name")}</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Full Name"
                    value={profileData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="dash-input-wrapper mb-20">
                  <label htmlFor="email">{t("Email")}</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="your.email@example.com"
                    value={profileData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="dash-input-wrapper mb-20">
                  <label htmlFor="phone">{t("Phone Number")}</label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="+1 234 567 8900"
                    value={profileData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="dash-input-wrapper mb-20">
                  <label htmlFor="password">{t("Current Password (Required to save changes)")}</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Enter your current password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="info-text d-sm-flex align-items-center justify-content-between mt-5">
                    <p className="m0">
                      {t("Want to change the password?")}
                      <Link href={`/${locale}/dashboard/account-settings/password-change`}>
                        {t(" Click here")}
                      </Link>
                    </p>
                    <Link
                      href={`/${locale}/dashboard/account-settings/password-change`}
                      className="chng-pass"
                    >
                      {t("Change Password")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="button-group d-inline-flex align-items-center mt-30">
              <button
                type="submit"
                className="dash-btn-two tran3s mx-3 "
                disabled={saving}
              >
                {saving ? t('Saving') : t('Save')}
              </button>
              <button type="button" className="dash-cancel-btn tran3s">
                {t("Cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingBody;