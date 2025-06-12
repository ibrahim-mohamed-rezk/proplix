import NiceSelect from "@/ui/NiceSelect";
import { useState, useEffect } from "react";

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

interface UserAvatarSettingProps {
  profileData: ProfileData | null;
  onUpdateProfile: (formData: any) => void;
  isUpdating: boolean;
}

const UserAvatarSetting: React.FC<UserAvatarSettingProps> = ({ 
  profileData, 
  onUpdateProfile, 
  isUpdating 
}) => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    phone: '',
    secondPhone: '',
    website: '',
    about: ''
  });

  useEffect(() => {
    if (profileData) {
      // Parse the full name into first and last name
      const nameParts = profileData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData({
        username: profileData.name,
        firstName: firstName,
        lastName: lastName,
        email: profileData.email,
        position: profileData.role,
        phone: profileData.phone,
        secondPhone: profileData.second_phone || '',
        website: '',
        about: ''
      });
    }
  }, [profileData]);

  const selectHandler = (e: any) => {
    setFormData(prev => ({
      ...prev,
      position: e.target.value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for API
    const updateData = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone,
      second_phone: formData.secondPhone,
      role: formData.position,
      // Add other fields as needed
      website: formData.website,
      about: formData.about
    };
    
    onUpdateProfile(updateData);
  };

  const handleCancel = () => {
    // Reset form to original data
    if (profileData) {
      const nameParts = profileData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData({
        username: profileData.name,
        firstName: firstName,
        lastName: lastName,
        email: profileData.email,
        position: profileData.role,
        phone: profileData.phone,
        secondPhone: profileData.second_phone || '',
        website: '',
        about: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-12">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="username">Username*</label>
            <input 
              type="text" 
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="JonyRio" 
            />
          </div>
        </div>
        <div className="col-sm-6">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="firstName">First Name*</label>
            <input 
              type="text" 
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Mr Johny" 
            />
          </div>
        </div>
        <div className="col-sm-6">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="lastName">Last Name*</label>
            <input 
              type="text" 
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Riolek" 
            />
          </div>
        </div>
        <div className="col-sm-6">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="email">Email*</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="companyinc@mail.com" 
            />
          </div>
        </div>
        <div className="col-sm-6">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="position">Position*</label>
            <NiceSelect 
              className="nice-select"
              options={[
                { value: "agent", text: "Agent" },
                { value: "agency", text: "Agency" },
              ]}
              defaultCurrent={formData.position === "agent" ? 0 : 1}
              onChange={selectHandler}
              name="position"
              placeholder="" 
            />
          </div>
        </div>
        <div className="col-sm-6">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="phone">Phone Number*</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+880 01723801729" 
            />
          </div>
        </div>
        <div className="col-sm-6">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="secondPhone">Second Phone</label>
            <input 
              type="tel" 
              name="secondPhone"
              value={formData.secondPhone}
              onChange={handleInputChange}
              placeholder="+880 01723801729" 
            />
          </div>
        </div>
        <div className="col-sm-6">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="website">Website*</label>
            <input 
              type="text" 
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="http://somename.com" 
            />
          </div>
        </div>
        <div className="col-12">
          <div className="dash-input-wrapper">
            <label htmlFor="about">About*</label>
            <textarea 
              className="size-lg"
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              placeholder="I am working for the last 4 years as a web designer, graphics designer and well as UI/UX designer............."
            />
            <div className="alert-text">Brief description for your profile. URLs are hyperlinked.</div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="button-group d-inline-flex align-items-center mt-30">
        <button 
          type="submit" 
          className="dash-btn-two tran3s me-3"
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Updating...
            </>
          ) : (
            'Save'
          )}
        </button>
        <button 
          type="button" 
          className="dash-cancel-btn tran3s"
          onClick={handleCancel}
          disabled={isUpdating}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default UserAvatarSetting