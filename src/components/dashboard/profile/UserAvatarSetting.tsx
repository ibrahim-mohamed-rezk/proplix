import NiceSelect from "@/ui/NiceSelect";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
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
  descriptions?: string | null;
  website?: string | null;
  id_number?: string | null;
  trade_licence?: string | null;
}

interface UserAvatarSettingProps {
  profileData: ProfileData | null;
  onUserDataChange: (userData: any) => void;
  isUpdating: boolean;
}

const UserAvatarSetting: React.FC<UserAvatarSettingProps> = ({ 
  profileData, 
  onUserDataChange, 
  isUpdating 
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    position: '',
    phone: '',
    secondPhone: '',
    website: '',
    descriptions: '',
    idFile: null as File | null,
    tradeLicence: null as File | null
  });

  const t = useTranslations("ProfileBody");
  const [tradeLicenceFileName, setTradeLicenceFileName] = useState<string>('');
  const [idFileName, setIdFileName] = useState<string>('');
  
  // Add states for image previews
  const [idImagePreview, setIdImagePreview] = useState<string>('');
  const [tradeLicenceImagePreview, setTradeLicenceImagePreview] = useState<string>('');

  useEffect(() => {
    if (profileData) {
      const userData = {
        username: profileData.name,
        email: profileData.email,
        position: profileData.role,
        phone: profileData.phone,
        secondPhone: profileData.second_phone || '',
        website: profileData.website || '',
        descriptions: profileData.descriptions || '',
        idFile: null,
        tradeLicence: null
      };

      setFormData(userData);
      onUserDataChange(userData);
      
      // Set existing file names and images if available
      if (profileData.trade_licence) {
        setTradeLicenceFileName(t('Current file uploaded'));
        // Assuming trade_licence contains the URL or base64 of the image
        setTradeLicenceImagePreview(profileData.trade_licence);
      }
      if (profileData.id_number) {
        setIdFileName(t('Current file uploaded'));
        // Assuming id_number contains the URL or base64 of the image
        setIdImagePreview(profileData.id_number);
      }
    }
  }, [profileData, onUserDataChange, t]);

  const selectHandler = (e: any) => {
    const updatedData = {
      ...formData,
      position: e.target.value
    };
    setFormData(updatedData);
    onUserDataChange(updatedData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value
    };
    setFormData(updatedData);
    onUserDataChange(updatedData);
  };

  // Helper function to check if file is an image
  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'tradeLicence' | 'idFile') => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (25MB limit)
      const maxSize = 25 * 1024 * 1024; // 25MB in bytes
      if (file.size > maxSize) {
        toast.error(t('File size exceeds 25MB limit'));
        return;
      }

      const updatedData = {
        ...formData,
        [fieldName]: file
      };
      setFormData(updatedData);
      
      if (fieldName === 'tradeLicence') {
        setTradeLicenceFileName(file.name);
        // Create preview for images
        if (isImageFile(file)) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setTradeLicenceImagePreview(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          setTradeLicenceImagePreview('');
        }
      } else {
        setIdFileName(file.name);
        // Create preview for images
        if (isImageFile(file)) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setIdImagePreview(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          setIdImagePreview('');
        }
      }
      
      onUserDataChange(updatedData);
    }
  };

  const handleRemoveFile = (fieldName: 'tradeLicence' | 'idFile') => {
    const updatedData = {
      ...formData,
      [fieldName]: null
    };
    setFormData(updatedData);
    
    if (fieldName === 'tradeLicence') {
      setTradeLicenceFileName('');
      setTradeLicenceImagePreview('');
      // Reset file input
      const fileInput = document.getElementById('tradeLicenceUpload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } else {
      setIdFileName('');
      setIdImagePreview('');
      // Reset file input
      const fileInput = document.getElementById('idUpload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
    
    onUserDataChange(updatedData);
  };

  // Component for displaying file preview
  const FilePreview: React.FC<{ 
    fileName: string; 
    imagePreview: string; 
    onRemove: () => void;
    fieldName: string;
  }> = ({ fileName, imagePreview, onRemove, fieldName }) => (
    <div style={{ 
      marginTop: '10px', 
      padding: '15px', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}>
      {imagePreview && (
        <div style={{ marginBottom: '10px' }}>
          <img 
            src={imagePreview} 
            alt={`${fieldName} preview`}
            style={{
              maxWidth: '200px',
              maxHeight: '150px',
              width: 'auto',
              height: 'auto',
              borderRadius: '4px',
              border: '1px solid #ddd',
              objectFit: 'cover'
            }}
          />
        </div>
      )}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{fileName}</span>
          {imagePreview && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
              {t("Image Preview Available")}
            </div>
          )}
        </div>
        <button 
          type="button"
          onClick={onRemove}
          style={{
            background: '#ff6b35',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '6px 12px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e55a2b'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
        >
          {t("Remove")}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="row">
        <div className="col-12">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="username">{t("Username*")}</label>
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
            <label htmlFor="email">{t("Email*")}</label>
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
            <label htmlFor="position">{t("Position*")}</label>
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
            <label htmlFor="phone">{t("Phone Number*")}</label>
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
            <label htmlFor="secondPhone">{t("Second Phone")}</label>
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
            <label htmlFor="website">{t("Website*")}</label>
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
            <label htmlFor="descriptions">{t("About*")}</label>
            <textarea 
              className="size-lg"
              name="descriptions"
              value={formData.descriptions}
              onChange={handleInputChange}
              placeholder="I am working for the last 4 years as a web designer, graphics designer and well as UI/UX designer............."
            />
            <div className="alert-text">{t("Brief")}</div>
          </div>
        </div>

        {/* ID Upload Section */}
        <div className="col-12">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="idFile">{t("ID*")}</label>
            <div className="upload-area" style={{
              border: '2px dashed #e0e0e0',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: '#f9f9f9',
              position: 'relative',
              cursor: 'pointer'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L12 5L17 10" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 5V15" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ color: '#ff6b35', marginBottom: '5px', cursor: 'pointer' }}>
               {t("Click to Upload ID")}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {t("or drag and drop")}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {t("Max")} 25MB
              </div>
              <input 
                type="file" 
                id="idUpload"
                onChange={(e) => handleFileChange(e, 'idFile')}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            {idFileName && (
              <FilePreview
                fileName={idFileName}
                imagePreview={idImagePreview}
                onRemove={() => handleRemoveFile('idFile')}
                fieldName="ID"
              />
            )}
          </div>
        </div>

        {/* Trade License Upload Section */}
        <div className="col-12">
          <div className="dash-input-wrapper mb-30">
            <label htmlFor="tradeLicence">{t("Trade License*")}</label>
            <div className="upload-area" style={{
              border: '2px dashed #e0e0e0',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: '#f9f9f9',
              position: 'relative',
              cursor: 'pointer'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L12 5L17 10" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 5V15" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ color: '#ff6b35', marginBottom: '5px', cursor: 'pointer' }}>
                {t("Click to Upload Trade License")}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {t("or drag and drop")}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {t("Max")} 25MB
              </div>
              <input 
                type="file" 
                id="tradeLicenceUpload"
                onChange={(e) => handleFileChange(e, 'tradeLicence')}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            {tradeLicenceFileName && (
              <FilePreview
                fileName={tradeLicenceFileName}
                imagePreview={tradeLicenceImagePreview}
                onRemove={() => handleRemoveFile('tradeLicence')}
                fieldName="Trade License"
              />
            )}
          </div>
        </div>
      </div> {/* row */}
    </div>
  );
}

export default UserAvatarSetting;