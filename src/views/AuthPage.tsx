'use client'
import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'
import OtpInput from '../components/OtpInput'
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
  ArrowLeft,
  RotateCcw,
  Check
} from 'lucide-react'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    user,
    isAuthenticated,
    login,
    loginRequest,
    verifyLoginOtp,
    registerRequest,
    verifyRegisterOtp,
    forgotPasswordRequest,
    resetPassword,
  } = useAuth()

  // Tab: 'signin' | 'register'
  const initialTab = searchParams.get('mode') === 'register' ? 'register' : 'signin'
  const [tab, setTab] = useState<'signin' | 'register'>(initialTab)

  // Step state for Sign In: 'credentials' | 'otp' | 'forgot_request' | 'forgot_verify'
  const [signInStep, setSignInStep] = useState<'credentials' | 'otp' | 'forgot_request' | 'forgot_verify'>('credentials')
  const [forgotOtp, setForgotOtp] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')
  const [showForgotPass, setShowForgotPass] = useState(false)
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false)

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
  const [showExtraDetails, setShowExtraDetails] = useState(false)

  // Password Strength Verification Logic
  const hasMinLength = registerPassword.length >= 8
  const hasUppercase = /[A-Z]/.test(registerPassword)
  const hasLowercase = /[a-z]/.test(registerPassword)
  const hasNumber = /[0-9]/.test(registerPassword)
  const hasSpecial = /[^A-Za-z0-9]/.test(registerPassword)

  const strengthScore = [
    hasMinLength,
    hasUppercase && hasLowercase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length

  const isStrongPassword = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial

  // Forgot Password Strength Verification
  const forgotHasMinLength = forgotNewPassword.length >= 8
  const forgotHasUppercase = /[A-Z]/.test(forgotNewPassword)
  const forgotHasLowercase = /[a-z]/.test(forgotNewPassword)
  const forgotHasNumber = /[0-9]/.test(forgotNewPassword)
  const forgotHasSpecial = /[^A-Za-z0-9]/.test(forgotNewPassword)
  const isForgotStrong =
    forgotHasMinLength && forgotHasUppercase && forgotHasLowercase && forgotHasNumber && forgotHasSpecial
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
    setForgotOtp('')
    setForgotNewPassword('')
    setForgotConfirmPassword('')
    setSignInStep('credentials')
    setRegisterStep('details')
  }

  // Forgot Password Handlers
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim()) {
      setError('Please enter your laboratory email.')
      return
    }
    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await forgotPasswordRequest(loginEmail.trim().toLowerCase())
      setSuccessMsg(res.message || `Verification passcode sent to ${loginEmail.trim()}`)
      setSignInStep('forgot_verify')
      setResendCooldown(45)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No registered laboratory account with this email address.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }
    if (!isForgotStrong) {
      setError('New password must satisfy all 5 laboratory security standards.')
      return
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await resetPassword(loginEmail.trim().toLowerCase(), forgotOtp.trim(), forgotNewPassword)
      setSuccessMsg(res.message || 'Password reset successfully! You can now sign in with your new credentials.')
      setLoginPassword('')
      setForgotOtp('')
      setForgotNewPassword('')
      setForgotConfirmPassword('')
      setSignInStep('credentials')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired verification code.')
    } finally {
      setLoading(false)
    }
  }

  // 1. SIGN IN: Direct password authentication (No OTP verification)
  const handleSignInRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPassword) return

    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const loggedInUser = await login(loginEmail.trim().toLowerCase(), loginPassword)
      if (loggedInUser.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (redirectUrl) {
        navigate(redirectUrl, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
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

  // 2. REGISTER: Step 1 (Email-first registration + Send OTP)
  const handleRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registerEmail.trim()) {
      setError('Please provide your email address.')
      return
    }

    if (registerPassword && !isStrongPassword) {
      setError('Please provide a password meeting laboratory security criteria, or leave it blank to authenticate with email passcodes.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await registerRequest({
        email: registerEmail.trim().toLowerCase(),
        name: name.trim() || undefined,
        password: registerPassword || undefined,
        phone: phone.trim() || undefined,
        shipping_address: shippingAddress.trim() || undefined,
        city: city.trim() || undefined,
        state: stateName.trim() || undefined,
        pincode: pincode.trim() || undefined,
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
        email: registerEmail.trim().toLowerCase(),
        otp_code: otpCode.trim(),
        name: name.trim() || undefined,
        password: registerPassword || undefined,
        phone: phone.trim() || undefined,
        shipping_address: shippingAddress.trim() || undefined,
        city: city.trim() || undefined,
        state: stateName.trim() || undefined,
        pincode: pincode.trim() || undefined,
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
          email: registerEmail.trim().toLowerCase(),
          name: name.trim() || undefined,
          password: registerPassword || undefined,
          phone: phone.trim() || undefined,
          shipping_address: shippingAddress.trim() || undefined,
          city: city.trim() || undefined,
          state: stateName.trim() || undefined,
          pincode: pincode.trim() || undefined,
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
    <div className="w-full min-h-screen relative flex flex-col items-center justify-between bg-[#0F0F11] selection:bg-neutral-200 font-['Inter',sans-serif] overflow-y-auto">
      {/* Main Container */}
      <div className={`flex-1 w-full px-6 pt-16 pb-20 flex flex-col justify-center my-auto ${tab === 'register' && registerStep === 'details' && showExtraDetails ? 'max-w-xl' : 'max-w-md'}`}>
        <div className="w-full bg-white/95 backdrop-blur-3xl border border-white/60 rounded-[36px] p-8 sm:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.35),_inset_0_1px_1px_rgba(255,255,255,0.9)] animate-modal-card">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
              <img src={(cmlogo as any)?.src || cmlogo} alt="Chembros" className="h-10 mx-auto object-contain" />
            </Link>
            <h1 className="font-['Conquera',sans-serif] text-2xl font-normal tracking-wider uppercase text-black mt-3">
              CHEM BROS
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-black/50 mt-1">
              Haute Parfumerie & Chemistry // Client Portal
            </p>
          </div>

          {/* Unified Two-Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#F5F5F7] rounded-full border border-black/5 mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('signin')}
              className={`py-2.5 text-xs font-semibold uppercase tracking-wider rounded-full transition-all cursor-pointer font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] ${
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
              className={`py-2.5 text-xs font-semibold uppercase tracking-wider rounded-full transition-all cursor-pointer font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] ${
                tab === 'register'
                  ? 'bg-black text-white shadow-md'
                  : 'text-black/50 hover:text-black'
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setSignInStep('forgot_request')
                          setError(null)
                          setSuccessMsg(null)
                        }}
                        className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 hover:text-black transition-colors underline underline-offset-2 cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
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
                        Signing In...
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : signInStep === 'otp' ? (
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

                  <div className="py-2">
                    <OtpInput
                      value={otpCode}
                      onChange={setOtpCode}
                      autoFocus
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
              ) : signInStep === 'forgot_request' ? (
                <form onSubmit={handleForgotRequest} className="space-y-4">
                  <div className="text-center space-y-1 mb-2">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-black mb-2 border border-neutral-200">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900 font-['Conquera',sans-serif] tracking-wider uppercase">
                      RESET PASSWORD
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Enter your laboratory email to receive a 6-digit verification code.
                    </p>
                  </div>

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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-4 bg-black text-white rounded-xl text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Transmitting Code...
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSignInStep('credentials')
                        setError(null)
                        setSuccessMsg(null)
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-black transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* signInStep === 'forgot_verify' */
                <form onSubmit={handleForgotVerifyAndReset} className="space-y-4">
                  <div className="text-center space-y-1 mb-2">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-black mb-2 border border-neutral-200">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900 font-['Conquera',sans-serif] tracking-wider uppercase">
                      SET NEW PASSWORD
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Dispatched to <strong className="text-black">{loginEmail}</strong>
                    </p>
                  </div>

                  <div className="py-2">
                    <label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase tracking-wider text-center">
                      6-Digit Verification Code
                    </label>
                    <OtpInput
                      value={forgotOtp}
                      onChange={setForgotOtp}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                      <input
                        type={showForgotPass ? 'text' : 'password'}
                        required
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="Enter new strong password"
                        className="w-full pl-10 pr-11 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotPass(!showForgotPass)}
                        className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                      >
                        {showForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Security Checklist */}
                  {forgotNewPassword && (
                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1 text-[11px] font-mono">
                      <div className={`flex items-center gap-1.5 ${forgotHasMinLength ? 'text-emerald-700' : 'text-neutral-400'}`}>
                        <Check className={`w-3.5 h-3.5 ${forgotHasMinLength ? 'text-emerald-600' : 'opacity-30'}`} />
                        <span>8+ characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${forgotHasUppercase && forgotHasLowercase ? 'text-emerald-700' : 'text-neutral-400'}`}>
                        <Check className={`w-3.5 h-3.5 ${forgotHasUppercase && forgotHasLowercase ? 'text-emerald-600' : 'opacity-30'}`} />
                        <span>Uppercase & lowercase</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${forgotHasNumber ? 'text-emerald-700' : 'text-neutral-400'}`}>
                        <Check className={`w-3.5 h-3.5 ${forgotHasNumber ? 'text-emerald-600' : 'opacity-30'}`} />
                        <span>At least one number (0-9)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${forgotHasSpecial ? 'text-emerald-700' : 'text-neutral-400'}`}>
                        <Check className={`w-3.5 h-3.5 ${forgotHasSpecial ? 'text-emerald-600' : 'opacity-30'}`} />
                        <span>Special character (!@#$%^&*)</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                      <input
                        type={showForgotConfirmPass ? 'text' : 'password'}
                        required
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-10 pr-11 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                        className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                      >
                        {showForgotConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || forgotOtp.length !== 6 || !isForgotStrong || forgotNewPassword !== forgotConfirmPassword}
                    className="w-full mt-2 py-3.5 px-4 bg-black text-white rounded-xl text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Reset Password
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSignInStep('forgot_request')
                        setError(null)
                      }}
                      className="flex items-center gap-1.5 text-neutral-500 hover:text-black transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={async () => {
                        if (resendCooldown > 0 || loading) return
                        setLoading(true)
                        setError(null)
                        setSuccessMsg(null)
                        try {
                          const res = await forgotPasswordRequest(loginEmail.trim().toLowerCase())
                          setResendCooldown(45)
                          setSuccessMsg(res?.message || 'Fresh verification code dispatched.')
                        } catch (err: unknown) {
                          setError(err instanceof Error ? err.message : 'Failed to dispatch code.')
                        } finally {
                          setLoading(false)
                        }
                      }}
                      className="text-black font-semibold hover:underline cursor-pointer disabled:opacity-40"
                    >
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
                  {/* 1. Email Address (Required) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                        Email Address *
                      </label>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">Required</span>
                    </div>
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
                    <p className="text-[11px] text-neutral-500 font-mono mt-1">
                      A 6-digit verification code will be dispatched to this email to activate your account.
                    </p>
                  </div>

                  {/* 2. Full Name (Optional) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                        Full Name
                      </label>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">Optional</span>
                    </div>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Eleanor Vance"
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* 3. Password (Optional) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">
                        Account Password
                      </label>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">Optional</span>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Leave blank for OTP-only, or enter password"
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

                    {/* Segmented Strength Meter & Criteria Badges (When Password is Typed) */}
                    {registerPassword.length > 0 && (
                      <div className="mt-2.5 space-y-2 p-3 bg-neutral-50/90 rounded-2xl border border-black/10 animate-in fade-in duration-200">
                        <div className="grid grid-cols-4 gap-1.5 h-1.5">
                          {[1, 2, 3, 4].map((step) => {
                            const isFilled = strengthScore >= step
                            return (
                              <div
                                key={step}
                                className={`rounded-full transition-all duration-300 ${
                                  isFilled ? 'bg-black' : 'bg-black/10'
                                }`}
                              />
                            )
                          })}
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1 text-[10px] font-mono">
                          <div className={`flex items-center gap-1.5 transition-colors ${hasMinLength ? 'text-black font-semibold' : 'text-black/40'}`}>
                            {hasMinLength ? (
                              <Check className="w-3 h-3 text-black stroke-[2.5]" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                            )}
                            <span>8+ Characters</span>
                          </div>
                          <div className={`flex items-center gap-1.5 transition-colors ${hasUppercase && hasLowercase ? 'text-black font-semibold' : 'text-black/40'}`}>
                            {hasUppercase && hasLowercase ? (
                              <Check className="w-3 h-3 text-black stroke-[2.5]" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                            )}
                            <span>Upper & Lower</span>
                          </div>
                          <div className={`flex items-center gap-1.5 transition-colors ${hasNumber ? 'text-black font-semibold' : 'text-black/40'}`}>
                            {hasNumber ? (
                              <Check className="w-3 h-3 text-black stroke-[2.5]" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                            )}
                            <span>1+ Number</span>
                          </div>
                          <div className={`flex items-center gap-1.5 transition-colors ${hasSpecial ? 'text-black font-semibold' : 'text-black/40'}`}>
                            {hasSpecial ? (
                              <Check className="w-3 h-3 text-black stroke-[2.5]" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                            )}
                            <span>1+ Symbol (!@#$)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Optional Delivery Details Toggle */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowExtraDetails(!showExtraDetails)}
                      className="text-xs font-mono uppercase tracking-wider text-black/60 hover:text-black flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{showExtraDetails ? 'âˆ’ Hide Delivery & Phone Details' : '+ Add Delivery Address & Phone (Optional)'}</span>
                    </button>
                  </div>

                  {showExtraDetails && (
                    <div className="space-y-3 pt-2 border-t border-neutral-200/60 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                          Phone Number (Optional)
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                          Delivery / Shipping Address (Optional)
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                          <input
                            type="text"
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
                            City
                          </label>
                          <div className="relative">
                            <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                            <input
                              type="text"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="e.g. Mumbai"
                              className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                            State
                          </label>
                          <div className="relative">
                            <Navigation className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                            <input
                              type="text"
                              value={stateName}
                              onChange={(e) => setStateName(e.target.value)}
                              placeholder="State"
                              className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                            PIN Code
                          </label>
                          <div className="relative">
                            <Hash className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                            <input
                              type="text"
                              maxLength={6}
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                              placeholder="400001"
                              className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || (registerPassword.length > 0 && !isStrongPassword)}
                    className="w-full mt-2 py-3.5 px-6 bg-black hover:bg-neutral-800 active:scale-[0.99] text-white rounded-full text-xs font-semibold uppercase tracking-[0.2em] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
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

                  <div className="py-2">
                    <OtpInput
                      value={otpCode}
                      onChange={setOtpCode}
                      autoFocus
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
