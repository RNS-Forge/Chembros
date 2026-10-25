import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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
  Sparkles,
  ShieldCheck
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

  if (!isAuthModalOpen) return null

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
      setSuccessMsg(res.message || `Verification code sent to ${email.trim()}`)
      setSignInStep('otp')
      setResendCooldown(45)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.')
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
      const loggedInUser = await verifyLoginOtp(email.trim().toLowerCase(), otpCode.trim())
      handleClose()
      if (loggedInUser.role === 'admin') {
        navigate('/admin')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired verification code.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Register Step 1: Submit details
  const handleRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim() || !shippingAddress.trim() || !city.trim() || !pincode.trim() || !password) {
      setError('Please fill in all contact & delivery details for automatic 1-click orders.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
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
      setSuccessMsg(res.message || `Verification code sent to ${email.trim()}`)
      setRegisterStep('otp')
      setResendCooldown(45)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Email may already be in use.')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200 ${
        tab === 'register' && registerStep === 'details' ? 'max-w-lg' : 'max-w-md'
      }`}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Title */}
        <div className="text-center mb-6">
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-neutral-400">
            CHEM BROS
          </p>
          <h2 className="font-['Cinzel',serif] text-xl font-bold text-neutral-900 mt-1">
            {tab === 'signin' ? 'Account Sign In' : 'Join Chembros'}
          </h2>
        </div>

        {/* Unified Tabs: Sign In | Create Account */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => handleTabChange('signin')}
            className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              tab === 'signin'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && !error && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: SIGN IN                                            */}
        {/* ========================================================= */}
        {tab === 'signin' && (
          <>
            {signInStep === 'credentials' ? (
              <form onSubmit={handleSignInRequest} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-black transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 py-3 px-4 bg-black text-white rounded-xl text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignInVerifyOtp} className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-black border border-neutral-200">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900">Enter Access Code</h3>
                  <p className="text-[11px] text-neutral-500">
                    Sent to <strong className="text-black">{email}</strong>
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
                    className="w-full py-3 px-4 bg-neutral-50 border border-neutral-300 rounded-xl text-xl font-mono tracking-[0.5em] text-center text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3 px-4 bg-black text-white rounded-xl text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Verify & Sign In
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSignInStep('credentials')
                      setError(null)
                    }}
                    className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-black cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={async () => {
                      setLoading(true)
                      try {
                        await loginRequest(email.trim().toLowerCase(), password)
                        setResendCooldown(45)
                        setSuccessMsg('Fresh code sent.')
                      } catch {
                        setError('Failed to resend code.')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    className="text-[11px] text-neutral-700 hover:text-black cursor-pointer disabled:opacity-40"
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
              <form onSubmit={handleRegisterRequest} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1 uppercase tracking-wider">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Eleanor Vance"
                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1 uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1 uppercase tracking-wider">
                    Delivery Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Flat, Street, Locality"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-700 mb-1 uppercase tracking-wider">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full px-2.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-700 mb-1 uppercase tracking-wider">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="State"
                      className="w-full px-2.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-700 mb-1 uppercase tracking-wider">
                      PIN *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="400001"
                      className="w-full px-2.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1 uppercase tracking-wider">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-9 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-black transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-black text-white rounded-xl text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Create Account
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterVerifyOtp} className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-black border border-neutral-200">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900">Verify Email</h3>
                  <p className="text-[11px] text-neutral-500">
                    Sent to <strong className="text-black">{email}</strong>
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
                    className="w-full py-3 px-4 bg-neutral-50 border border-neutral-300 rounded-xl text-xl font-mono tracking-[0.5em] text-center text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3 px-4 bg-black text-white rounded-xl text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm & Complete
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterStep('details')
                      setError(null)
                    }}
                    className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-black cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Back
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
                        setSuccessMsg('Fresh code sent.')
                      } catch {
                        setError('Failed to resend code.')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    className="text-[11px] text-neutral-700 hover:text-black cursor-pointer disabled:opacity-40"
                  >
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        <div className="mt-6 pt-3 border-t border-neutral-100 flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
          <ShieldCheck className="w-3 h-3" />
          <span>Real-time SMTP Verification</span>
        </div>
      </div>
    </div>
  )
}
