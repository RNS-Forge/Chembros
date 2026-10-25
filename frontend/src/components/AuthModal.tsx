import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import authBg from '../assets/auth_bg.jpg'
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Check
} from 'lucide-react'

export default function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginRequest,
    verifyLoginOtp,
    registerRequest,
    verifyRegisterOtp
  } = useAuth()
  const navigate = useNavigate()

  // Tab: 'signin' | 'register'
  const [tab, setTab] = useState<'signin' | 'register'>('signin')

  // Step state: 'credentials' / 'details' vs 'otp'
  const [signInStep, setSignInStep] = useState<'credentials' | 'otp'>('credentials')
  const [registerStep, setRegisterStep] = useState<'details' | 'otp'>('details')

  // Form Fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('Tamil Nadu')
  const [pincode, setPincode] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Feedback State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Prevent background page scrolling when modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isAuthModalOpen])

  if (!isAuthModalOpen) return null

  // Password Strength Verification Logic
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  const strengthScore = [
    hasMinLength,
    hasUppercase && hasLowercase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length

  const isStrongPassword = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial

  const handleClose = () => {
    setIsAuthModalOpen(false)
    setError(null)
    setSuccessMsg(null)
    setOtpCode('')
    setSignInStep('credentials')
    setRegisterStep('details')
  }

  const handleTabChange = (newTab: 'signin' | 'register') => {
    setTab(newTab)
    setError(null)
    setSuccessMsg(null)
    setOtpCode('')
    setSignInStep('credentials')
    setRegisterStep('details')
  }

  // 1. Sign In Step 1: Submit email & password
  const handleSignInRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await loginRequest(email.trim().toLowerCase(), password)
      setSuccessMsg(res.message || `Verification passcode dispatched to ${email.trim()}`)
      setSignInStep('otp')
      setResendCooldown(45)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid laboratory email or password.')
    } finally {
      setLoading(false)
    }
  }

  // 1. Sign In Step 2: Verify OTP
  const handleSignInVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const user = await verifyLoginOtp(email.trim().toLowerCase(), otpCode.trim())
      handleClose()
      if (user.role === 'admin') {
        navigate('/admin')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired verification code.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Register Step 1: Submit Details & Request OTP
  const handleRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password || !name.trim() || !phone.trim() || !shippingAddress.trim() || !city.trim() || !pincode.trim()) {
      setError('Please complete all required fields.')
      return
    }

    // Verify strong password
    if (!isStrongPassword) {
      setError('Please provide a strong password meeting all 4 laboratory security criteria.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await registerRequest({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        shipping_address: shippingAddress.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pincode: pincode.trim(),
      })
      setSuccessMsg(res.message || `Verification passcode dispatched to ${email.trim()}`)
      setRegisterStep('otp')
      setResendCooldown(45)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Email may already be registered.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Register Step 2: Verify OTP
  const handleRegisterVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const newUser = await verifyRegisterOtp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        shipping_address: shippingAddress.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pincode: pincode.trim(),
        otp_code: otpCode.trim(),
      })
      handleClose()
      if (newUser.role === 'admin') {
        navigate('/admin')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired verification code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-hidden">
      {/* Ambient Animated Laboratory Flacon Atmosphere in Background */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none">
        <img
          src={authBg}
          alt="Chembros Fragrance Atelier Atmosphere"
          className="w-full h-full object-cover object-center opacity-30 scale-105 animate-[pulse_10s_ease-in-out_infinite] filter blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[140px] rounded-full animate-pulse pointer-events-none" />
      </div>

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full bg-white/95 backdrop-blur-2xl border border-white/40 rounded-[36px] p-7 sm:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-in zoom-in-95 duration-300 selection:bg-black selection:text-white ${
          tab === 'register' && registerStep === 'details' ? 'max-w-xl' : 'max-w-md'
        }`}
      >
        {/* Sleek Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#F5F5F7] hover:bg-black hover:text-white text-black/60 flex items-center justify-center transition-all duration-300 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6 pr-8 sm:pr-0">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] uppercase text-black/50 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            <span>LABORATORY ACCESS // CLIENT ARCHIVE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal font-['Conquera',sans-serif] tracking-wider uppercase text-black leading-tight">
            {tab === 'signin'
              ? signInStep === 'otp'
                ? 'SECURITY PASSCODE'
                : 'CLIENT SIGN IN'
              : registerStep === 'otp'
              ? 'CONFIRM EMAIL'
              : 'JOIN CHEMBROS'}
          </h2>
          <p className="text-xs text-black/60 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] mt-1.5 tracking-wide">
            {tab === 'signin'
              ? 'Access private monographs, acquisitions and tracked lab batches'
              : 'Register for priority formulations and white-glove dispatch'}
          </p>
        </div>

        {/* Segmented Tab Pill Selector (when on initial form step) */}
        {((tab === 'signin' && signInStep === 'credentials') || (tab === 'register' && registerStep === 'details')) && (
          <div className="p-1 bg-[#F5F5F7] rounded-full border border-black/5 grid grid-cols-2 gap-1 mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('signin')}
              className={`py-2.5 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-300 cursor-pointer font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] ${
                tab === 'signin'
                  ? 'bg-black text-white shadow-md'
                  : 'text-black/50 hover:text-black'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`py-2.5 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-300 cursor-pointer font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] ${
                tab === 'register'
                  ? 'bg-black text-white shadow-md'
                  : 'text-black/50 hover:text-black'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error & Success Notices */}
        {error && (
          <div className="mb-5 p-3.5 bg-neutral-900 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-300 text-xs shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span className="font-['Inter',sans-serif]">{error}</span>
          </div>
        )}
        {successMsg && !error && (
          <div className="mb-5 p-3.5 bg-neutral-900 border border-emerald-500/30 rounded-2xl flex items-start gap-3 text-emerald-300 text-xs shadow-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span className="font-['Inter',sans-serif]">{successMsg}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: SIGN IN                                            */}
        {/* ========================================================= */}
        {tab === 'signin' && (
          <>
            {signInStep === 'credentials' ? (
              <form onSubmit={handleSignInRequest} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono tracking-widest text-black/60 uppercase block mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-black/40 stroke-[1.5]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@chembros.com"
                      className="w-full pl-10 pr-4 py-3 bg-[#FAFBFB] hover:bg-white focus:bg-white border border-black/10 focus:border-black rounded-2xl text-xs sm:text-sm text-black placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-black transition-all font-['Inter',sans-serif]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono tracking-widest text-black/60 uppercase block mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-black/40 stroke-[1.5]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter laboratory password"
                      className="w-full pl-10 pr-10 py-3 bg-[#FAFBFB] hover:bg-white focus:bg-white border border-black/10 focus:border-black rounded-2xl text-xs sm:text-sm text-black placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-black transition-all font-['Inter',sans-serif]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-black/40 hover:text-black transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 bg-black hover:bg-neutral-800 active:scale-[0.99] text-white rounded-full text-xs font-semibold uppercase tracking-[0.2em] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4 stroke-[2]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignInVerifyOtp} className="space-y-5">
                <div className="text-center space-y-1.5 py-2">
                  <div className="w-12 h-12 bg-[#F5F5F7] rounded-full flex items-center justify-center mx-auto text-black border border-black/5">
                    <KeyRound className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <h3 className="text-sm font-semibold font-['Conquera',sans-serif] tracking-wider uppercase text-black">
                    ENTER PASSCODE
                  </h3>
                  <p className="text-xs text-black/60 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                    Dispatched to <strong className="text-black font-semibold">{email}</strong>
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full py-3.5 px-4 bg-[#FAFBFB] border border-black/15 rounded-2xl text-2xl font-mono tracking-[0.6em] text-center text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3.5 px-6 bg-black hover:bg-neutral-800 active:scale-[0.99] text-white rounded-full text-xs font-semibold uppercase tracking-[0.2em] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Passcode...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                      <span>Verify & Access Account</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-black/5 font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      setSignInStep('credentials')
                      setError(null)
                    }}
                    className="flex items-center gap-1 text-[11px] text-black/50 hover:text-black transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={async () => {
                      setLoading(true)
                      try {
                        await loginRequest(email.trim().toLowerCase(), password)
                        setResendCooldown(45)
                        setSuccessMsg('Fresh passcode dispatched.')
                      } catch {
                        setError('Failed to dispatch code.')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    className="text-[11px] text-black/70 hover:text-black font-semibold cursor-pointer disabled:opacity-40"
                  >
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CREATE ACCOUNT (WITH ORDER & DELIVERY DETAILS)     */}
        {/* ========================================================= */}
        {tab === 'register' && (
          <>
            {registerStep === 'details' ? (
              <form onSubmit={handleRegisterRequest} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-black/60 uppercase block mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-black/40 stroke-[1.5]" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Eleanor Vance"
                        className="w-full pl-10 pr-3 py-2.5 bg-[#FAFBFB] hover:bg-white focus:bg-white border border-black/10 focus:border-black rounded-2xl text-xs text-black placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-black transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-black/60 uppercase block mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-black/40 stroke-[1.5]" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-3 py-2.5 bg-[#FAFBFB] hover:bg-white focus:bg-white border border-black/10 focus:border-black rounded-2xl text-xs text-black placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-black transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono tracking-widest text-black/60 uppercase block mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-black/40 stroke-[1.5]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@chembros.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-[#FAFBFB] hover:bg-white focus:bg-white border border-black/10 focus:border-black rounded-2xl text-xs text-black placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono tracking-widest text-black/60 uppercase block mb-1">
                    Delivery Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-black/40 stroke-[1.5]" />
                    <input
                      type="text"
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Suite, Street, Residential Complex"
                      className="w-full pl-10 pr-3 py-2.5 bg-[#FAFBFB] hover:bg-white focus:bg-white border border-black/10 focus:border-black rounded-2xl text-xs text-black placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-black/60 uppercase block mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full px-3 py-2.5 bg-[#FAFBFB] hover:bg-white focus:bg-white border border-black/10 focus:border-black rounded-2xl text-xs text-black placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-black/60 uppercase block mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="State"
                      className="w-full px-3 py-2.5 bg-[#FAFBFB] hover:bg-white focus:bg-white border border-black/10 focus:border-black rounded-2xl text-xs text-black placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-black/60 uppercase block mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="400001"
                      className="w-full px-3 py-2.5 bg-[#FAFBFB] hover:bg-white focus:bg-white border border-black/10 focus:border-black rounded-2xl text-xs text-black placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-black transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password Input with Real-time Strength Indicator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono tracking-widest text-black/60 uppercase block">
                      Laboratory Password *
                    </label>
                    {password.length > 0 && (
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                          strengthScore <= 1
                            ? 'text-red-500'
                            : strengthScore === 2
                            ? 'text-amber-500'
                            : strengthScore === 3
                            ? 'text-blue-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {strengthScore <= 1
                          ? 'Weak'
                          : strengthScore === 2
                          ? 'Moderate'
                          : strengthScore === 3
                          ? 'Good'
                          : 'Archive Strong'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-black/40 stroke-[1.5]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#FAFBFB] hover:bg-white focus:bg-white border border-black/10 focus:border-black rounded-2xl text-xs text-black placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-black/40 hover:text-black transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Segmented Strength Meter & Criteria Badges */}
                  {password.length > 0 && (
                    <div className="mt-2.5 space-y-2 p-3 bg-neutral-50/80 rounded-2xl border border-black/5 animate-in fade-in duration-200">
                      {/* 4 Segmented Strength Bars */}
                      <div className="grid grid-cols-4 gap-1.5 h-1.5">
                        {[1, 2, 3, 4].map((step) => {
                          let barColor = 'bg-black/10'
                          if (strengthScore >= step) {
                            if (strengthScore <= 1) barColor = 'bg-red-500'
                            else if (strengthScore === 2) barColor = 'bg-amber-500'
                            else if (strengthScore === 3) barColor = 'bg-blue-600'
                            else barColor = 'bg-emerald-500'
                          }
                          return (
                            <div
                              key={step}
                              className={`rounded-full transition-all duration-300 ${barColor}`}
                            />
                          )
                        })}
                      </div>

                      {/* 4 Security Criteria Pills */}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[10px] font-mono">
                        <div className={`flex items-center gap-1.5 transition-colors ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-black/40'}`}>
                          {hasMinLength ? (
                            <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                          )}
                          <span>8+ Characters</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${hasUppercase && hasLowercase ? 'text-emerald-700 font-semibold' : 'text-black/40'}`}>
                          {hasUppercase && hasLowercase ? (
                            <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                          )}
                          <span>Upper & Lower</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-black/40'}`}>
                          {hasNumber ? (
                            <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                          )}
                          <span>1+ Number</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${hasSpecial ? 'text-emerald-700 font-semibold' : 'text-black/40'}`}>
                          {hasSpecial ? (
                            <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                          )}
                          <span>1+ Symbol (!@#$)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || (password.length > 0 && !isStrongPassword)}
                    className="w-full py-3.5 px-6 bg-black hover:bg-neutral-800 active:scale-[0.99] text-white rounded-full text-xs font-semibold uppercase tracking-[0.2em] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Passcode...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4 stroke-[2]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterVerifyOtp} className="space-y-5">
                <div className="text-center space-y-1.5 py-2">
                  <div className="w-12 h-12 bg-[#F5F5F7] rounded-full flex items-center justify-center mx-auto text-black border border-black/5">
                    <KeyRound className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <h3 className="text-sm font-semibold font-['Conquera',sans-serif] tracking-wider uppercase text-black">
                    VERIFY LABORATORY REGISTRATION
                  </h3>
                  <p className="text-xs text-black/60 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                    Passcode dispatched to <strong className="text-black font-semibold">{email}</strong>
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full py-3.5 px-4 bg-[#FAFBFB] border border-black/15 rounded-2xl text-2xl font-mono tracking-[0.6em] text-center text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3.5 px-6 bg-black hover:bg-neutral-800 active:scale-[0.99] text-white rounded-full text-xs font-semibold uppercase tracking-[0.2em] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                      <span>Confirm & Complete Registration</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-black/5 font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterStep('details')
                      setError(null)
                    }}
                    className="flex items-center gap-1 text-[11px] text-black/50 hover:text-black transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={async () => {
                      setLoading(true)
                      try {
                        await registerRequest({
                          name: name.trim(),
                          email: email.trim().toLowerCase(),
                          password,
                          phone: phone.trim(),
                          shipping_address: shippingAddress.trim(),
                          city: city.trim(),
                          state: stateName.trim(),
                          pincode: pincode.trim(),
                        })
                        setResendCooldown(45)
                        setSuccessMsg('Fresh passcode dispatched.')
                      } catch {
                        setError('Failed to dispatch code.')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    className="text-[11px] text-black/70 hover:text-black font-semibold cursor-pointer disabled:opacity-40"
                  >
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Security Assurance Badge */}
        <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-center gap-2 text-[10px] font-mono tracking-widest uppercase text-black/40">
          <ShieldCheck className="w-3.5 h-3.5 text-black/50" />
          <span>AUTHENTICATED VIA SECURE GMAIL SMTP</span>
        </div>
      </div>
    </div>
  )
}
