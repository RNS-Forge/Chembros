import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import cmlogo from '../assets/cmlogo.png'
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  MapPin,
  Building,
  Navigation,
  Hash,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Sparkles,
  ArrowLeft,
  RotateCcw
} from 'lucide-react'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, loginRequest, verifyLoginOtp, registerRequest, verifyRegisterOtp } = useAuth()

  // Tab: 'signin' | 'register'
  const initialTab = searchParams.get('mode') === 'register' ? 'register' : 'signin'
  const [tab, setTab] = useState<'signin' | 'register'>(initialTab)

  // Step state for Sign In: 'credentials' | 'otp'
  const [signInStep, setSignInStep] = useState<'credentials' | 'otp'>('credentials')

  // Step state for Register: 'details' | 'otp'
  const [registerStep, setRegisterStep] = useState<'details' | 'otp'>('details')

  // Sign In Form Fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register Form Fields (Gathering ALL details needed for instant order placement!)
  const [name, setName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('Tamil Nadu')
  const [pincode, setPincode] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')

  // OTP & UI State
  const [otpCode, setOtpCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  const redirectUrl = searchParams.get('redirect')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (redirectUrl) {
        navigate(redirectUrl, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }
  }, [isAuthenticated, user, navigate, redirectUrl])

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleTabChange = (newTab: 'signin' | 'register') => {
    setTab(newTab)
    setError(null)
    setSuccessMsg(null)
    setOtpCode('')
    setSignInStep('credentials')
    setRegisterStep('details')
  }

  // 1. SIGN IN: Step 1
  const handleSignInRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPassword) return

    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await loginRequest(loginEmail.trim().toLowerCase(), loginPassword)
      setSuccessMsg(res.message || `Verification code sent to ${loginEmail.trim()}`)
      setSignInStep('otp')
      setResendCooldown(45)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  // 1. SIGN IN: Step 2
  const handleSignInVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const loggedInUser = await verifyLoginOtp(loginEmail.trim().toLowerCase(), otpCode.trim())
      if (loggedInUser.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (redirectUrl) {
        navigate(redirectUrl, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired verification code.')
    } finally {
      setLoading(false)
    }
  }

  // 2. REGISTER: Step 1 (Collect All Order Details + Send OTP)
  const handleRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !registerEmail.trim() || !phone.trim() || !shippingAddress.trim() || !city.trim() || !pincode.trim() || !registerPassword) {
      setError('Please provide all details. These are securely saved for automatic 1-click orders.')
      return
    }

    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await registerRequest({
        name: name.trim(),
        email: registerEmail.trim().toLowerCase(),
        password: registerPassword,
        phone: phone.trim(),
        shipping_address: shippingAddress.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pincode: pincode.trim(),
      })
      setSuccessMsg(res.message || `Verification code sent to ${registerEmail.trim()}`)
      setRegisterStep('otp')
      setResendCooldown(45)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Email may already be registered.')
    } finally {
      setLoading(false)
    }
  }

  // 2. REGISTER: Step 2 (Verify OTP & Save Profile in DB)
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
        email: registerEmail.trim().toLowerCase(),
        password: registerPassword,
        phone: phone.trim(),
        shipping_address: shippingAddress.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pincode: pincode.trim(),
        otp_code: otpCode.trim(),
      })
      if (newUser.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (redirectUrl) {
        navigate(redirectUrl, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired verification code.')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return

    setLoading(true)
    setError(null)
    try {
      if (tab === 'signin') {
        await loginRequest(loginEmail.trim().toLowerCase(), loginPassword)
      } else {
        await registerRequest({
          name: name.trim(),
          email: registerEmail.trim().toLowerCase(),
          password: registerPassword,
          phone: phone.trim(),
          shipping_address: shippingAddress.trim(),
          city: city.trim(),
          state: stateName.trim(),
          pincode: pincode.trim(),
        })
      }
      setSuccessMsg('A fresh verification code was sent to your email.')
      setResendCooldown(45)
    } catch {
      setError('Failed to resend code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-neutral-50 flex flex-col items-center selection:bg-neutral-200 font-['Inter',sans-serif]">
      {/* Sticky Luxury Navigation */}
      <div className="w-full flex justify-center pt-8 pb-6 sticky top-0 z-40 bg-neutral-50/80 backdrop-blur-md">
        <NavBar />
      </div>

      {/* Main Container */}
      <div className={`flex-1 w-full px-6 py-10 flex flex-col justify-center ${tab === 'register' && registerStep === 'details' ? 'max-w-xl' : 'max-w-md'}`}>
        <div className="w-full bg-white border border-neutral-200/90 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
              <img src={cmlogo} alt="Chembros" className="h-10 mx-auto object-contain" />
            </Link>
            <h1 className="font-['Cinzel',serif] text-2xl font-bold tracking-tight text-neutral-900 mt-3">
              CHEM BROS
            </h1>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500 mt-0.5">
              Haute Parfumerie & Chemistry
            </p>
          </div>

          {/* Unified Two-Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('signin')}
              className={`py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
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
              className={`py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                tab === 'register'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error & Success Feedback */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/90 border border-red-200/80 rounded-2xl flex items-start gap-3 text-red-700 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {successMsg && !error && (
            <div className="mb-6 p-4 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 1: SIGN IN                                                 */}
          {/* ============================================================== */}
          {tab === 'signin' && (
            <>
              {signInStep === 'credentials' ? (
                <form onSubmit={handleSignInRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-10 pr-11 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-black transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-4 bg-black text-white rounded-xl text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignInVerifyOtp} className="space-y-4">
                  <div className="text-center space-y-1 mb-2">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-black mb-2 border border-neutral-200">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900">Enter Access Code</h3>
                    <p className="text-xs text-neutral-500">
                      We sent a 6-digit code to <strong className="text-black">{loginEmail}</strong>
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
                      className="w-full py-3.5 px-4 bg-neutral-50 border border-neutral-300 rounded-xl text-2xl font-mono tracking-[0.5em] text-center text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full py-3.5 px-4 bg-black text-white rounded-xl text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying Code...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Verify & Sign In
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSignInStep('credentials')
                        setError(null)
                        setOtpCode('')
                      }}
                      className="flex items-center gap-1.5 text-neutral-500 hover:text-black transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Sign In
                    </button>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={handleResendOtp}
                      className="flex items-center gap-1.5 text-neutral-700 hover:text-black transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* ============================================================== */}
          {/* TAB 2: CREATE ACCOUNT (WITH ALL ORDER & DELIVERY DETAILS!)     */}
          {/* ============================================================== */}
          {tab === 'register' && (
            <>
              {registerStep === 'details' ? (
                <form onSubmit={handleRegisterRequest} className="space-y-4">
                  <div className="p-3 bg-neutral-50 border border-neutral-200/60 rounded-2xl text-[11px] text-neutral-600 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                    <span>Your delivery details are gathered once so you can order with 1-click without retyping.</span>
                  </div>

                  {/* Personal Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Eleanor Vance"
                          className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                      <input
                        type="email"
                        required
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Delivery Address Details */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Delivery / Shipping Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        required
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Flat / Suite, Street, Locality or Landmark"
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                        City *
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Mumbai"
                          className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                        State *
                      </label>
                      <div className="relative">
                        <Navigation className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          placeholder="State"
                          className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                        PIN Code *
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                          placeholder="400001"
                          className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Create Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-11 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-neutral-400 hover:text-black transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-4 bg-black text-white rounded-xl text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Continue with Verification
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterVerifyOtp} className="space-y-4">
                  <div className="text-center space-y-1 mb-2">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-black mb-2 border border-neutral-200">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900">Verify Your Email</h3>
                    <p className="text-xs text-neutral-500">
                      We sent a 6-digit confirmation code to <strong className="text-black">{registerEmail}</strong>
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
                      className="w-full py-3.5 px-4 bg-neutral-50 border border-neutral-300 rounded-xl text-2xl font-mono tracking-[0.5em] text-center text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full py-3.5 px-4 bg-black text-white rounded-xl text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm & Complete
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterStep('details')
                        setError(null)
                        setOtpCode('')
                      }}
                      className="flex items-center gap-1.5 text-neutral-500 hover:text-black transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={handleResendOtp}
                      className="flex items-center gap-1.5 text-neutral-700 hover:text-black transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* Bottom Security Note */}
          <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
            <span>Encrypted Chembros Auth Architecture</span>
          </div>
        </div>
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  )
}
