"use client"
import DashboardHeaderTwo from "@/layouts/headers/dashboard/DashboardHeaderTwo"
import Link from "next/link"
import { postData } from "@/libs/server/backendServer"
import { useState } from "react"
import { toast } from "react-toastify"
import { useTranslations } from "next-intl"
import { Eye, EyeOff } from "lucide-react"

const PasswordChangeBody = ({ token }: { token: string }) => {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const t = useTranslations('ProfileBody')

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.current_password) {
      newErrors.current_password = t("Current password is required")
    }

    if (!formData.new_password) {
      newErrors.new_password = t("New password is required")
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = t("New password must be at least 8 characters")
    }

    if (!formData.new_password_confirmation) {
      newErrors.new_password_confirmation = t("Password confirmation is required")
    } else if (formData.new_password !== formData.new_password_confirmation) {
      newErrors.new_password_confirmation = t("Passwords do not match")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('current_password', formData.current_password)
      formDataToSend.append('new_password', formData.new_password)
      formDataToSend.append('new_password_confirmation', formData.new_password_confirmation)

      const response = await postData(
        'agent/profile/update-password',
        formDataToSend,
        {
          'Authorization': `Bearer ${token}`,
        }
      )

      console.log('Password updated successfully:', response)
      toast.success(t('Password updated successfully!'))
      
      setFormData({
        current_password: "",
        new_password: "",
        new_password_confirmation: ""
      })

    } catch (error: any) {
      console.error('Error updating password:', error)
      
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors
        setErrors(apiErrors)
        const firstError = Object.values(apiErrors)[0] as string
        toast.error(firstError)
      } else if (error.response?.data?.message) {
        const errorMessage = error.response.data.message
        setErrors({ general: errorMessage })
        toast.error(errorMessage)
      } else {
        const errorMessage = 'An error occurred while updating password'
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-body">
      <div className="position-relative">
        <DashboardHeaderTwo title="Change Password" />
        <div className="bg-white card-box">
          {errors.general && (
            <div className="alert alert-danger mb-3">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-12">
                <div className="dash-input-wrapper mb-20">
                  <label htmlFor="current_password">{t("Old Password*")}</label>
                  <div className="position-relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="current_password"
                      name="current_password"
                      value={formData.current_password}
                      onChange={handleInputChange}
                      placeholder={t("Type current password")}
                      className={errors.current_password ? 'error' : ''}
                      style={{ paddingRight: '45px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="password-toggle-btn"
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={18} color="#666" />
                      ) : (
                        <Eye size={18} color="#666" />
                      )}
                    </button>
                  </div>
                  {errors.current_password && (
                    <span className="error-text" style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px', display: 'block' }}>{errors.current_password}</span>
                  )}
                </div>
              </div>
              
              <div className="col-12">
                <div className="dash-input-wrapper mb-20">
                  <label htmlFor="new_password">{t("New Password*")}</label>
                  <div className="position-relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="new_password"
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleInputChange}
                      placeholder={t("Enter your new password")}
                      className={errors.new_password ? 'error' : ''}
                      style={{ paddingRight: '45px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="password-toggle-btn"
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} color="#666" />
                      ) : (
                        <Eye size={18} color="#666" />
                      )}
                    </button>
                  </div>
                  {errors.new_password && (
                    <span className="error-text" style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px', display: 'block' }}>{errors.new_password}</span>
                  )}
                </div>
              </div>
              
              <div className="col-12">
                <div className="dash-input-wrapper mb-20">
                  <label htmlFor="new_password_confirmation">{t("Confirm Password*")}</label>
                  <div className="position-relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="new_password_confirmation"
                      name="new_password_confirmation"
                      value={formData.new_password_confirmation}
                      onChange={handleInputChange}
                      placeholder={t("Confirm your new password")}
                      className={errors.new_password_confirmation ? 'error' : ''}
                      style={{ paddingRight: '45px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="password-toggle-btn"
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} color="#666" />
                      ) : (
                        <Eye size={18} color="#666" />
                      )}
                    </button>
                  </div>
                  {errors.new_password_confirmation && (
                    <span className="error-text" style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px', display: 'block' }}>{errors.new_password_confirmation}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="button-group d-inline-flex align-items-center">
              <button
                type="submit"
                disabled={loading}
                className="dash-btn-two tran3s"
              >
                {loading ? t('Updating') : t('Save & Update')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PasswordChangeBody