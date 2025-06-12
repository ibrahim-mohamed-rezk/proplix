"use client"
import DashboardHeaderTwo from "@/layouts/headers/dashboard/DashboardHeaderTwo"
import Image from "next/image"
import UserAvatarSetting from "./UserAvatarSetting"
import AddressAndLocation from "./AddressAndLocation"
import Link from "next/link"
import SocialMediaLink from "./SocialMediaLink"
import avatar_1 from "@/assets/images/dashboard/avatar_02.jpg"
import { deleteData, getData, postData } from "@/libs/server/backendServer";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface ProfileData {
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
}

const ProfileBody = ({ token }: { token: string }) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  // Get token from localStorage or your auth context
  

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const headers = getAuthHeaders();
        const response = await getData('agent/profile', {}, headers);
        setProfileData(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);
console.log("profileData", profileData);

  const handleUpdateProfile = async (formData: any) => {
    try {
      setUpdating(true);
      setUpdateMessage(null);
      setError(null);
      
      const headers = getAuthHeaders();
      const response = await postData('profile/update', formData, headers);
      
      // Update local state with new data
      setProfileData(response.data || response);
      setUpdateMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateMessage(null), 3000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-body">
        <div className="position-relative">
          <div className="bg-white card-box text-center p-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-body">
        <div className="position-relative">
          <div className="bg-white card-box text-center p-5">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
            <button 
              className="btn btn-primary mt-3" 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-body">
      <div className="position-relative">
        {/* Success Message */}
        {updateMessage && (
          <div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
            {updateMessage}
            <button 
              type="button" 
              className="btn-close" 
              aria-label="Close"
              onClick={() => setUpdateMessage(null)}
            ></button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              aria-label="Close"
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        {/* <DashboardHeaderTwo title="Profile" /> */}
        {/* <h2 className="main-title d-block d-lg-none">Profile</h2> */}
        <div className="bg-white card-box">
          <div className="user-avatar-setting d-flex align-items-center mb-30">
            <Image 
              src={profileData?.avatar || avatar_1} 
              alt="User Avatar" 
              className="lazy-img user-img"
              width={80}
              height={80}
            />
            <div className="upload-btn position-relative tran3s ms-4 me-3">
              Upload new photo
              <input type="file" id="uploadImg" name="uploadImg" placeholder="" />
            </div>
            <button className="delete-btn tran3s">Delete</button>
          </div>
          <UserAvatarSetting 
            profileData={profileData} 
            onUpdateProfile={handleUpdateProfile}
            isUpdating={updating}
          />
        </div>
        <SocialMediaLink />
        <AddressAndLocation />
      </div>
    </div>
  )
}

export default ProfileBody