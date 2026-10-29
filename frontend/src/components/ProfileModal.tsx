import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  User,
  Camera,
  Lock,
  HelpCircle,
  LogOut,
  Check,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Eye,
  EyeOff,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { ProfileTab } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function ProfileModal() {
  const {
    user,
    isProfileModalOpen,
    closeProfileModal,
    profileActiveTab,
    updateProfile,
    changePassword,
    logout,
  } = useAuth()

  const [activeTab, setActiveTab] = useState<ProfileTab>('details')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Details Tab Form
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('Tamil Nadu')
  const [pincode, setPincode] = useState('')

  // Avatar Tab
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Security Tab
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)

  // Feedback State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Sync tab from context
  useEffect(() => {
    if (profileActiveTab) {
      setActiveTab(profileActiveTab)
    }
  }, [profileActiveTab])

  // Sync user details when modal opens
  useEffect(() => {
    if (user && isProfileModalOpen) {
      setName(user.name || '')
      setPhone(user.phone || '')
      setShippingAddress(user.shipping_address || '')
      setCity(user.city || '')
      setStateName(user.state || 'Tamil Nadu')
      setPincode(user.pincode || '')
      setAvatarPreview(user.avatar_url || null)
      setError(null)
      setSuccess(null)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }, [user, isProfileModalOpen])

  // Strictly prevent background scrolling while open
  useEffect(() => {
    if (isProfileModalOpen) {
      const originalBodyOverflow = document.body.style.overflow
      const originalHtmlOverflow = document.documentElement.style.overflow
      const originalTouchAction = document.body.style.touchAction

      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'

      const handlePreventBgScroll = (e: WheelEvent | TouchEvent) => {
        const target = e.target as HTMLElement | null
        if (!target || !target.closest('[data-modal-card]')) {
          if (e.cancelable) e.preventDefault()
        }
      }

      window.addEventListener('wheel', handlePreventBgScroll, { passive: false })
      window.addEventListener('touchmove', handlePreventBgScroll, { passive: false })

      return () => {
        document.body.style.overflow = originalBodyOverflow
        document.documentElement.style.overflow = originalHtmlOverflow
        document.body.style.touchAction = originalTouchAction
        window.removeEventListener('wheel', handlePreventBgScroll)
        window.removeEventListener('touchmove', handlePreventBgScroll)
      }
    }
  }, [isProfileModalOpen])

  if (!isProfileModalOpen || !user) return null

  // Password Security Criteria
  const hasMinLength = newPassword.length >= 8
  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasLowercase = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword)
  const isStrongPassword =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial

  // 1. Save Profile Details
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        shipping_address: shippingAddress.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pincode: pincode.trim(),
      })
      setSuccess('Profile details and saved delivery address updated successfully.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile details.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Handle Image Upload & Convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result)
        setError(null)
      }
    }
    reader.readAsDataURL(file)
  }

  // Save Avatar Photo
  const handleSaveAvatar = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await updateProfile({
        avatar_url: avatarPreview || '',
      })
      setSuccess('Profile image updated successfully.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile photo.')
    } finally {
      setLoading(false)
    }
  }

  // Remove Avatar Photo
  const handleRemoveAvatar = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await updateProfile({
        avatar_url: '',
      })
      setAvatarPreview(null)
      setSuccess('Profile photo removed.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove photo.')
    } finally {
      setLoading(false)
    }
  }

  // 3. Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      setError('Please provide your current password.')
      return
    }
    if (!isStrongPassword) {
      setError('New password must satisfy all 5 laboratory security standards.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await changePassword(currentPassword, newPassword)
      setSuccess(res.message || 'Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-lenis-prevent
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-hidden touch-none select-none overscroll-none"
    >
      {/* Dimmed Blurred Backdrop */}
      <div
        onClick={closeProfileModal}
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Card */}
      <div
        data-modal-card
        data-lenis-prevent
        className="relative w-full max-w-[620px] max-h-[92vh] bg-white rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.3)] border border-black/10 flex flex-col z-10 transition-all duration-300"
      >
        
        {/* Header Bar */}
        <div className="p-6 sm:p-7 bg-neutral-900 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3.5">
            {/* User Avatar Circle */}
            <div className="relative group/avatar cursor-pointer" onClick={() => setActiveTab('avatar')}>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user.name || 'User'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/30 group-hover/avatar:border-white transition-all shadow-md"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white text-black font-bold flex items-center justify-center text-base tracking-wider border-2 border-white/30">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold tracking-wide text-white uppercase font-['Cinzel',serif]">
                  {user.name || 'Client Specimen'}
                </h2>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/15 text-white/90 border border-white/20">
                  {user.role === 'admin' ? 'Master Admin' : 'Client'}
                </span>
              </div>
              <p className="text-xs text-white/60 font-mono tracking-tight mt-0.5">
                {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeProfileModal}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close Profile Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-black/10 bg-neutral-50 px-4 sm:px-6 overflow-x-auto scrollbar-none shrink-0 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-xs uppercase tracking-wider">
          <button
            type="button"
            onClick={() => {
              setActiveTab('details')
              setError(null)
              setSuccess(null)
            }}
            className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-black/50 hover:text-black'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('avatar')
              setError(null)
              setSuccess(null)
            }}
            className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'avatar'
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-black/50 hover:text-black'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('security')
              setError(null)
              setSuccess(null)
            }}
            className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-black/50 hover:text-black'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('help')
              setError(null)
              setSuccess(null)
            }}
            className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'help'
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-black/50 hover:text-black'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help & Concierge</span>
          </button>
        </div>

        {/* Scrollable Content Body (Hidden scrollbars with contained scrolling) */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-5 flex-1 overscroll-contain no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Notifications */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* =========================================================
              TAB 1: EDIT PROFILE DETAILS
              ========================================================= */}
          {activeTab === 'details' && (
            <form onSubmit={handleSaveDetails} className="space-y-4 text-xs font-['Inter',sans-serif]">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sriram Raghavan"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Registered Laboratory Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-500 cursor-not-allowed select-none"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Email is locked to your authenticated security account.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Saved Delivery Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                  <textarea
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="House/Apt No., Street, Landmark"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Chennai"
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="Tamil Nadu"
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="600001"
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-black hover:bg-neutral-800 active:scale-95 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 mt-4"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile Changes'}
              </button>
            </form>
          )}

          {/* =========================================================
              TAB 2: UPLOAD IMAGE / AVATAR
              ========================================================= */}
          {activeTab === 'avatar' && (
            <div className="space-y-6 text-center font-['Inter',sans-serif]">
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-black/10 shadow-xl bg-neutral-100 flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-14 h-14 text-neutral-300" />
                  )}
                </div>

                <p className="text-xs text-neutral-500 mt-3 max-w-xs">
                  Upload a high-resolution portrait or personal monogram (JPG, PNG, or WEBP up to 5MB).
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-black rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Choose Photo</span>
                </button>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={loading}
                    className="px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              {avatarPreview && avatarPreview !== user.avatar_url && (
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  disabled={loading}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 active:scale-95 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save New Profile Photo'}
                </button>
              )}
            </div>
          )}

          {/* =========================================================
              TAB 3: CHANGE PASSWORD
              ========================================================= */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-['Inter',sans-serif]">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-black cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full pl-10 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-black cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Checklist */}
              {newPassword && (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5 text-[11px]">
                  <div className="font-semibold text-neutral-600 uppercase text-[10px] tracking-wider mb-1">
                    Security Verification:
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700' : 'text-neutral-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600' : 'opacity-30'}`} />
                    <span>At least 8 characters in length</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700' : 'text-neutral-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasUppercase ? 'text-emerald-600' : 'opacity-30'}`} />
                    <span>Includes at least one uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-700' : 'text-neutral-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasLowercase ? 'text-emerald-600' : 'opacity-30'}`} />
                    <span>Includes at least one lowercase letter (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700' : 'text-neutral-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600' : 'opacity-30'}`} />
                    <span>Includes at least one numerical digit (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700' : 'text-neutral-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasSpecial ? 'text-emerald-600' : 'opacity-30'}`} />
                    <span>Includes at least one special character (!@#$%^&*)</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isStrongPassword || newPassword !== confirmPassword}
                className="w-full py-3.5 bg-black hover:bg-neutral-800 active:scale-95 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 mt-4"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
              </button>
            </form>
          )}

          {/* =========================================================
              TAB 4: HELP & CONCIERGE
              ========================================================= */}
          {activeTab === 'help' && (
            <div className="space-y-4 font-['Inter',sans-serif] text-xs">
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-neutral-900 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <span>Chembros Laboratory Concierge</span>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  For olfactory formulation inquiries, bespoke batches, delivery tracking, or order modifications, connect directly with our studio technicians.
                </p>

                <div className="pt-2 border-t border-neutral-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-mono text-[11px]">Email Concierge:</span>
                    <a
                      href="mailto:support@chembros.com"
                      className="font-semibold text-black hover:underline"
                    >
                      support@chembros.com
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-mono text-[11px]">Laboratory Studio:</span>
                    <span className="font-semibold text-black">Madurai & Chennai, Tamil Nadu</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-mono text-[11px]">Working Hours:</span>
                    <span className="font-semibold text-black">Mon – Sat, 09:00 – 20:00 IST</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  to="/my-orders"
                  onClick={closeProfileModal}
                  className="p-4 rounded-xl border border-neutral-200 hover:border-black bg-white hover:bg-neutral-50 transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <ShoppingBag className="w-4 h-4 text-neutral-600 group-hover:text-black" />
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black" />
                  </div>
                  <div className="mt-3">
                    <span className="font-semibold text-black block">Track My Orders</span>
                    <span className="text-[10px] text-neutral-500">Live order status & receipts</span>
                  </div>
                </Link>

                <Link
                  to="/our-story"
                  onClick={closeProfileModal}
                  className="p-4 rounded-xl border border-neutral-200 hover:border-black bg-white hover:bg-neutral-50 transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <HelpCircle className="w-4 h-4 text-neutral-600 group-hover:text-black" />
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black" />
                  </div>
                  <div className="mt-3">
                    <span className="font-semibold text-black block">Our Heritage</span>
                    <span className="text-[10px] text-neutral-500">Extraction & molecule science</span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer Logout Action */}
        <div className="p-4 sm:p-5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between shrink-0 font-['Inter',sans-serif]">
          <span className="text-[11px] text-neutral-500 font-mono">
            Client ID: #{user.id} · {user.role === 'admin' ? 'Administrator' : 'Verified Member'}
          </span>

          <button
            type="button"
            onClick={() => {
              closeProfileModal()
              logout()
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  )
}
