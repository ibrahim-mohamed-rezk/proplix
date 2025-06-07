"use client";
import NiceSelect from "@/ui/NiceSelect";
import { deleteData, getData, postData } from "@/libs/server/backendServer";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import Image from "next/image";

const UserAvatarSetting = ({ token }: { token: string }) => {
  const locale = useLocale();
  const [profileData, setProfileData] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Profile form data
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    second_phone: "",
    avatar: null as File | null,
  });

  // Password form data
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const selectHandler = (e: any) => {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData(
          `agent/profile`,
          {},
          {
            Authorization: `Bearer ${token}`,
          }
        );
        setProfileData(response.data.data);
        // Initialize profile form with fetched data
        const data = response.data.data;
        setProfileForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          second_phone: data.second_phone || "",
          avatar: null,
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchData();
  }, [token, locale]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileForm({ ...profileForm, avatar: file });

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", profileForm.name);
      formData.append("email", profileForm.email);
      formData.append("phone", profileForm.phone);
      formData.append("second_phone", profileForm.second_phone);
      if (profileForm.avatar) {
        formData.append("avatar", profileForm.avatar);
      }

      const response = await postData("agent/profile/update", formData, {
        Authorization: `Bearer ${token}`,
      });

      if (response.success) {
        alert("Profile updated successfully!");
        setShowProfileModal(false);
        setAvatarPreview(null);
        // Refresh profile data
        window.location.reload();
      }
    } catch (error) {
      alert("Error updating profile!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: any) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      alert("New passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("current_password", passwordForm.current_password);
      formData.append("new_password", passwordForm.new_password);
      formData.append(
        "new_password_confirmation",
        passwordForm.new_password_confirmation
      );

      const response = await postData(
        "agent/profile/update-password",
        formData,
        {
          lang: locale,
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.success) {
        alert("Password updated successfully!");
        setShowPasswordModal(false);
        setPasswordForm({
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
      }
    } catch (error) {
      alert("Error updating password!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setAvatarPreview(null);
    // Reset form to original values
    if (profileData) {
      setProfileForm({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        second_phone: profileData.second_phone || "",
        avatar: null,
      });
    }
  };

  return (
    <>
      <div className="row">
{/* Avatar Section */}
<div className="col-12 mb-8">
  <div className="flex items-center gap-4">
    <div className="relative inline-block">
      {profileData?.avatar && (
        <Image
          width={100}
          height={100}
          src={profileData.avatar}
          alt="Profile Avatar"
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 aspect-square mb-4"
        />
      )}
      {!profileData?.avatar && (
        <div className="w-25 h-25 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-300 aspect-square">
          <span className="text-4xl text-gray-400">👤</span>
        </div>
      )}
    </div>
    <div className="flex flex-col flex-grow">
      <h5 className="text-lg font-semibold">{profileData?.name || "Loading..."}</h5>
      <p className="text-gray-500">{profileData?.role || ""}</p>
    </div>
    <div className="flex gap-3 ml-auto">
      <button
        type="button"
        className="btn btn-success"
        onClick={() => setShowProfileModal(true)}
      >
        Update Profile
      </button>
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => setShowPasswordModal(true)}
      >
        Update Password
      </button>
    </div>
  </div>
</div>

        {/* Username */}
        <div className="col-sm-6">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="">Username*</label>
            <input
              type="text"
              placeholder="Username"
              value={profileData?.name || ""}
              onChange={() => {}}
              readOnly
            />
          </div>
        </div>

        {/* Email */}
        <div className="col-sm-6">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="">Email*</label>
            <input
              type="email"
              placeholder="Email"
              value={profileData?.email || ""}
              onChange={() => {}}
              readOnly
            />
          </div>
        </div>

        {/* Role/Position */}
        <div className="col-sm-6">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="">Role*</label>
            <input
              type="text"
              value={profileData?.role || ""}
              onChange={() => {}}
              readOnly
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="col-sm-6">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="">Phone Number*</label>
            <input
              type="tel"
              placeholder="Phone Number"
              value={profileData?.phone || ""}
              onChange={() => {}}
              readOnly
            />
          </div>
        </div>

        {/* Parent ID */}
        <div className="col-sm-6">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="">Parent ID</label>
            <input
              type="text"
              value={profileData?.parent_id || "N/A"}
              onChange={() => {}}
              readOnly
            />
          </div>
        </div>

        {/* Subscription Status */}
        <div className="col-sm-6">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="">Subscription Status</label>
            <input
              type="text"
              value={profileData?.subscription || "N/A"}
              onChange={() => {}}
              readOnly
            />
          </div>
        </div>

        {/* Email Verification Status */}
        <div className="col-sm-6">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="">Email Verified</label>
            <input
              type="text"
              value={
                profileData?.email_verified_at ? "Verified" : "Not Verified"
              }
              onChange={() => {}}
              readOnly
            />
          </div>
        </div>

        {/* Modules */}
        <div className="col-12">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="">Modules</label>
            <textarea
              className="size-lg"
              placeholder="No modules assigned"
              value={
                profileData?.modules?.length > 0
                  ? profileData.modules.join(", ")
                  : "No modules assigned"
              }
              onChange={() => {}}
              readOnly
            ></textarea>
            <div className="alert-text">
              List of assigned modules for this user.
            </div>
          </div>
        </div>
      </div>

      {/* Profile Update Modal */}
      {showProfileModal && (
        <div
          className="modal"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Profile</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeProfileModal}
                ></button>
              </div>
              <form onSubmit={handleProfileSubmit}>
                <div className="modal-body">
                  {/* Avatar Preview Section */}
                  <div className="dash-input-wrapper mb-20 text-center">
                    <label>Current Avatar</label>
                    <div className="avatar-preview-container">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar Preview"
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #ddd",
                            marginBottom: "10px",
                          }}
                        />
                      ) : profileData?.avatar ? (
                        <img
                          src={profileData.avatar}
                          alt="Current Avatar"
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #ddd",
                            marginBottom: "10px",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            backgroundColor: "#f0f0f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid #ddd",
                            margin: "0 auto 10px",
                          }}
                        >
                          <span style={{ fontSize: "32px", color: "#999" }}>
                            👤
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="dash-input-wrapper mb-20">
                    <label>Name*</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="dash-input-wrapper mb-20">
                    <label>Email*</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="dash-input-wrapper mb-20">
                    <label>Phone*</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="dash-input-wrapper mb-20">
                    <label>Second Phone</label>
                    <input
                      type="tel"
                      value={profileForm.second_phone}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          second_phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="dash-input-wrapper mb-20">
                    <label>Avatar Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    {profileForm.avatar && (
                      <div className="mt-2">
                        <small className="text-success">
                          ✓ Selected: {profileForm.avatar.name}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeProfileModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div
          className="modal"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Password</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPasswordModal(false)}
                ></button>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div className="modal-body">
                  <div className="dash-input-wrapper mb-20">
                    <label>Current Password*</label>
                    <input
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          current_password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="dash-input-wrapper mb-20">
                    <label>New Password*</label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          new_password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="dash-input-wrapper mb-20">
                    <label>Confirm New Password*</label>
                    <input
                      type="password"
                      value={passwordForm.new_password_confirmation}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          new_password_confirmation: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserAvatarSetting;
