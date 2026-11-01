'use client'
import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import OtpInput from '../components/OtpInput'
import FullPageLoader from '../components/FullPageLoader'

// Authentic Chembros Visual Assets
import heroBg from '../assets/hero.png'
import angelArt from '../assets/bg/angel.png'
import bottleImg from '../assets/bottle.png'
import bottle1 from '../assets/bg/1.png'
import whiteLogo from '../assets/cmlogo.png'

// Guaranteed URL String Resolution for Next.js Bundles
const defaultBottle = (bottleImg as any)?.src || bottleImg
const defaultBottle1 = (bottle1 as any)?.src || bottle1
const defaultAngel = (angelArt as any)?.src || angelArt
const defaultHero = (heroBg as any)?.src || heroBg
const defaultLogo = (whiteLogo as any)?.src || whiteLogo

import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  MapPin,
  Building,
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
  Truck,
  CreditCard,
  Home,
} from 'lucide-react'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    isAuthenticated,
    user,
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

  // Register Form Fields (Shipping ID & Complete Address)
  const [name, setName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [landmark, setLandmark] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')

  // OTP & UI State
  const [otpCode, setOtpCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [useOtpLogin, setUseOtpLogin] = useState(false)

  // Async feedback state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Redirect destination
  const redirectUrl = searchParams.get('redirect')

  // Auto redirect if already authenticated
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
  }, [isAuthenticated, user, redirectUrl, navigate])

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Switch tabs smoothly
  const handleTabChange = (newTab: 'signin' | 'register') => {
    setTab(newTab)
    setError(null)
    setSuccessMsg(null)
    setOtpCode('')
    setSignInStep('credentials')
    setRegisterStep('details')
  }

  // 1. SIGN IN: Direct password or OTP trigger
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!useOtpLogin && !loginPassword) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      if (useOtpLogin) {
        await loginRequest(loginEmail.trim().toLowerCase(), loginPassword || 'otp-flow')
        setSignInStep('otp')
        setResendCooldown(45)
        setSuccessMsg(`A 6-digit access code has been dispatched to ${loginEmail.trim().toLowerCase()}.`)
      } else {
        const loggedInUser = await login(loginEmail.trim().toLowerCase(), loginPassword)
        if (loggedInUser.role === 'admin') {
          navigate('/admin', { replace: true })
        } else if (redirectUrl) {
          navigate(redirectUrl, { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please verify your email and password.')
    } finally {
      setLoading(false)
    }
  }

  // 1. SIGN IN: Verify OTP
  const handleSignInVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code.')
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

  // 2. FORGOT PASSWORD: Request Code
  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim()) {
      setError('Please enter your registered email address.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      await forgotPasswordRequest(loginEmail.trim().toLowerCase())
      setSignInStep('forgot_verify')
      setResendCooldown(60)
      setSuccessMsg(`Password reset code dispatched to ${loginEmail.trim().toLowerCase()}.`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send reset code. Please check your email.')
    } finally {
      setLoading(false)
    }
  }

  // 2. FORGOT PASSWORD: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      setError('Please enter the 6-digit security code.')
      return
    }

    if (!forgotNewPassword) {
      setError('Please enter a new password.')
      return
    }

    if (forgotNewPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setError('New passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await resetPassword(loginEmail.trim().toLowerCase(), forgotOtp.trim(), forgotNewPassword)
      setSuccessMsg('Your password has been successfully updated. Please sign in.')
      setSignInStep('credentials')
      setLoginPassword('')
      setForgotOtp('')
      setForgotNewPassword('')
      setForgotConfirmPassword('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. The code may have expired.')
    } finally {
      setLoading(false)
    }
  }

  // 3. REGISTER: Submit Details & Trigger OTP
  const handleRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registerEmail.trim()) {
      setError('Please provide your email address.')
      return
    }

    if (!name.trim()) {
      setError('Please enter your full legal name.')
      return
    }

    if (!phone.trim() || phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number for courier dispatch.')
      return
    }

    if (!pincode.trim() || pincode.trim().length < 6) {
      setError('Please enter a valid 6-digit postal pincode (Shipping ID).')
      return
    }

    if (!shippingAddress.trim()) {
      setError('Please enter your delivery street address.')
      return
    }

    if (!city.trim()) {
      setError('Please enter your city.')
      return
    }

    if (registerPassword && registerPassword.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    const fullAddress = [
      shippingAddress.trim(),
      landmark.trim() ? `Near / Landmark: ${landmark.trim()}` : null,
    ].filter(Boolean).join(', ')

    try {
      await registerRequest({
        email: registerEmail.trim().toLowerCase(),
        name: name.trim() || undefined,
        password: registerPassword || undefined,
        phone: phone.trim() || undefined,
        shipping_address: fullAddress || undefined,
        city: city.trim() || undefined,
        pincode: pincode.trim() || undefined,
      })
      setRegisterStep('otp')
      setResendCooldown(45)
      setSuccessMsg(`Verification code sent to ${registerEmail.trim().toLowerCase()}.`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. This email may already be registered.')
    } finally {
      setLoading(false)
    }
  }

  // 3. REGISTER: Verify OTP & Finalize Account Creation
  const handleRegisterVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    setLoading(true)
    setError(null)

    const fullAddress = [
      shippingAddress.trim(),
      landmark.trim() ? `Near / Landmark: ${landmark.trim()}` : null,
    ].filter(Boolean).join(', ')

    try {
      const newUser = await verifyRegisterOtp({
        email: registerEmail.trim().toLowerCase(),
        otp_code: otpCode.trim(),
        name: name.trim() || undefined,
        password: registerPassword || undefined,
        phone: phone.trim() || undefined,
        shipping_address: fullAddress || undefined,
        city: city.trim() || undefined,
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
    <div className="w-screen h-screen overflow-hidden bg-[#07090C] text-white flex select-none relative font-['Inter',sans-serif]">
      {loading && (
        <FullPageLoader
          message={tab === 'signin' ? 'AUTHENTICATING CLIENT VAULT...' : 'SYNTHESIZING CLIENT SIGN UP...'}
          submessage="256-bit SSL Cryptographic Verification"
        />
      )}
      {/* Return to Home Transparent Button (NO SOLID CIRCLE BACKGROUND) */}
      <Link
        to="/"
        className={`fixed top-6 right-6 z-50 p-2.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 group ${
          tab === 'signin'
            ? 'text-neutral-700 hover:text-black hover:bg-black/5'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        }`}
        title="Return to Home"
        aria-label="Return to Home"
      >
        <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
      </Link>

      {/* ============================================================== */}
      {/* FULL-PAGE EDGE-TO-EDGE SPLIT VIEW (NO FLOATING CARDS)          */}
      {/* Fits whole screen without scrolling                             */}
      {/* ============================================================== */}
      <div className="w-full h-full relative overflow-hidden flex">

        {/* ============================================================ */}
        {/* PANEL 1: DARK ATMOSPHERIC VISUAL SECTION (50% WIDTH)         */}
        {/* Smooth Transition: In Sign In -> Left (0%). In Sign Up -> Right (50%) */}
        {/* ============================================================ */}
        <div
          className={`hidden lg:flex w-1/2 h-full absolute top-0 bottom-0 z-10 flex-col justify-between p-10 xl:p-14 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            tab === 'signin' ? 'left-0' : 'left-1/2'
          }`}
        >
          {/* Edge-to-Edge Atmospheric Background Asset */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img
              src={defaultAngel}
              alt="Chembros Heritage"
              className="w-full h-full object-cover object-center opacity-40 scale-105 filter blur-[0.5px]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#07090D]/90 via-[#07090D]/75 to-[#07090D]/95" />
            <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#628399]/15 rounded-full blur-[130px]" />
          </div>

          {/* Top Branding (Logo & Category Tag - NO EMOJIS) */}
          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-3">
              <img
                src={defaultLogo}
                alt="Chembros"
                className="h-8 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="font-['Conquera',sans-serif] text-base font-normal tracking-widest uppercase text-white leading-none">
                  CHEM BROS
                </span>
                <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-white/50 mt-1">
                  Haute Parfumerie
                </span>
              </div>
            </div>

            <div>
              {/* Clean Client Access Vault Tag without any emojis or sparkles */}
              <div className="inline-block mb-2">
                <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/70 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                  {tab === 'signin' ? 'CLIENT ACCESS VAULT' : 'CONCIERGE REGISTRATION'}
                </span>
              </div>

              <h1 className="font-['Conquera',sans-serif] text-2xl xl:text-3xl font-normal uppercase tracking-wider text-white leading-tight">
                {tab === 'signin' ? 'MOLECULAR SYNTHESIS' : 'CONCIERGE ACCESS'}
              </h1>
              <p className="font-['Cinzel',serif] text-sm text-white/75 italic mt-1.5 leading-snug">
                {tab === 'signin'
                  ? 'Where Molecular Chemistry Meets Haute Parfumerie.'
                  : 'Personalized Extrait Allocations & Verified Shipping ID.'}
              </p>
            </div>
          </div>

          {/* Perfume Bottle Image (Properly loaded via resolved static path) */}
          <div className="relative z-10 flex-1 flex items-center justify-center py-4">
            <div className="w-36 h-48 xl:w-44 xl:h-56 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl transform scale-75" />
              <img
                src={tab === 'signin' ? defaultBottle : defaultBottle1}
                alt="Chembros Extrait Flacon"
                className="w-full h-full object-contain filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.9)] transform hover:scale-105 transition-transform duration-500 will-change-transform"
                loading="eager"
              />
            </div>
          </div>

          {/* Bottom Badges (NO EMOJIS) */}
          <div className="relative z-10 space-y-2.5 border-t border-white/10 pt-5">
            <div className="flex items-center gap-3 text-xs text-white/80">
              <Truck className="w-4 h-4 text-neutral-300 shrink-0" />
              <span className="font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-[11px] xl:text-xs">
                Complimentary white-glove shipping on orders above ₹1,500
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/80">
              <CreditCard className="w-4 h-4 text-neutral-300 shrink-0" />
              <span className="font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-[11px] xl:text-xs">
                Cashfree PG production secured // 256-bit SSL encrypted
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PANEL 2: CRISP FORM SECTION (50% WIDTH)                       */}
        {/* Smooth Transition: In Sign In -> Right (50%). In Sign Up -> Left (0%) */}
        {/* ============================================================ */}
        <div
          className={`w-full lg:w-1/2 h-full bg-[#FAF9F6] text-black flex flex-col justify-between p-8 sm:p-12 xl:p-16 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] absolute top-0 bottom-0 z-20 ${
            tab === 'signin' ? 'lg:left-1/2' : 'lg:left-0'
          }`}
        >
          {/* Centered Top Toggle Switcher */}
          <div className="w-full flex justify-center items-center pt-1 mb-4">
            <div className="inline-flex p-1.5 bg-[#EAEAEA] rounded-full border border-black/5 shadow-inner">
              <button
                type="button"
                onClick={() => handleTabChange('signin')}
                className={`px-8 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all cursor-pointer font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] ${
                  tab === 'signin'
                    ? 'bg-black text-white shadow-md'
                    : 'text-black/60 hover:text-black'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('register')}
                className={`px-8 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all cursor-pointer font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] ${
                  tab === 'register'
                    ? 'bg-black text-white shadow-md'
                    : 'text-black/60 hover:text-black'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Compact Error / Success Alerts */}
          {error && (
            <div className="my-1.5 py-2 px-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-xs animate-in fade-in max-w-lg mx-auto w-full">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <div className="flex-1 font-medium truncate">{error}</div>
            </div>
          )}

          {successMsg && !error && (
            <div className="my-1.5 py-2 px-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs animate-in fade-in max-w-lg mx-auto w-full">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <div className="flex-1 font-medium truncate">{successMsg}</div>
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* FORM AREA: SIGN IN VIEW                                    */}
          {/* ---------------------------------------------------------- */}
          {tab === 'signin' && (
            <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
              {signInStep === 'credentials' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <h2 className="font-['Conquera',sans-serif] text-xl sm:text-2xl font-normal uppercase tracking-wider text-black">
                      CLIENT SIGN IN
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                      Access your private client portal, orders & allocations.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-700 block mb-1.5 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="client@domain.com"
                        className="w-full pl-10 pr-4 py-3 bg-[#F0EFEB] border border-black/10 rounded-xl text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>
                  </div>

                  {!useOtpLogin && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-700 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setSignInStep('forgot_request')
                            setError(null)
                            setSuccessMsg(null)
                          }}
                          className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 hover:text-black transition-colors underline cursor-pointer"
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
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-10 py-3 bg-[#F0EFEB] border border-black/10 rounded-xl text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-black cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode Toggle: Password vs OTP */}
                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setUseOtpLogin(!useOtpLogin)
                        setError(null)
                      }}
                      className="text-xs font-mono text-neutral-600 hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{useOtpLogin ? 'Sign in with Password Instead' : 'Sign in with One-Time Email Code'}</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-full bg-black text-white font-semibold text-xs uppercase tracking-wider hover:bg-neutral-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] mt-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>{useOtpLogin ? 'Send Access Passcode' : 'Sign In to Client Portal'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Sign In Step: OTP Verification */}
              {signInStep === 'otp' && (
                <form onSubmit={handleSignInVerifyOtp} className="space-y-5 text-center">
                  <div>
                    <h3 className="font-['Conquera',sans-serif] text-xl font-normal uppercase text-black">
                      ENTER VERIFICATION CODE
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                      We sent a 6-digit access code to <strong className="text-black">{loginEmail}</strong>
                    </p>
                  </div>

                  <div className="flex justify-center py-2">
                    <OtpInput value={otpCode} onChange={setOtpCode} length={6} autoFocus />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full py-3.5 px-6 rounded-full bg-black text-white font-semibold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Access Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 font-mono">
                    <button
                      type="button"
                      onClick={() => setSignInStep('credentials')}
                      className="hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Email</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                      className="hover:text-black transition-colors cursor-pointer disabled:opacity-40"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}

              {/* Forgot Password Step 1: Request Code */}
              {signInStep === 'forgot_request' && (
                <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                  <div>
                    <h3 className="font-['Conquera',sans-serif] text-xl font-normal uppercase text-black">
                      RESET PASSWORD
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                      Enter your registered email to receive a secure reset passcode.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-700 block mb-1.5 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                      Registered Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="client@domain.com"
                        className="w-full pl-10 pr-4 py-3 bg-[#F0EFEB] border border-black/10 rounded-xl text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-full bg-black text-white font-semibold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Dispatching Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Passcode</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setSignInStep('credentials')}
                      className="text-xs font-mono text-neutral-500 hover:text-black transition-colors cursor-pointer"
                    >
                      Cancel and Return to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Forgot Password Step 2: Set New Password */}
              {signInStep === 'forgot_verify' && (
                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  <div>
                    <h3 className="font-['Conquera',sans-serif] text-lg font-normal uppercase text-black">
                      CREATE NEW PASSWORD
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                      Enter the code sent to <strong className="text-black">{loginEmail}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-700 block mb-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                      6-Digit Security Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full px-4 py-2.5 bg-[#F0EFEB] border border-black/10 rounded-xl text-center text-sm font-mono tracking-widest text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-700 block mb-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                        New Password
                      </label>
                      <input
                        type={showForgotPass ? 'text' : 'password'}
                        required
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 bg-[#F0EFEB] border border-black/10 rounded-xl text-xs text-black font-mono focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-700 block mb-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                        Confirm Password
                      </label>
                      <input
                        type={showForgotConfirmPass ? 'text' : 'password'}
                        required
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 bg-[#F0EFEB] border border-black/10 rounded-xl text-xs text-black font-mono focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 rounded-full bg-black text-white font-semibold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <span>Save & Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* FORM AREA: REGISTER VIEW (NO STRONG PASSWORD METER)        */}
          {/* ---------------------------------------------------------- */}
          {tab === 'register' && (
            <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
              {registerStep === 'details' && (
                <form onSubmit={handleRegisterRequest} className="space-y-3.5">
                  <div>
                    <h2 className="font-['Conquera',sans-serif] text-xl font-normal uppercase tracking-wider text-black">
                      CLIENT SIGN UP
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                      Complete your profile to generate your verified Shipping ID.
                    </p>
                  </div>

                  {/* Row 1: Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-700 block mb-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                        Full Name *
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Lord / Lady Sterling"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#F0EFEB] border border-black/10 rounded-xl text-xs sm:text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-700 block mb-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                        <input
                          type="email"
                          required
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          placeholder="client@domain.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#F0EFEB] border border-black/10 rounded-xl text-xs sm:text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Mobile Phone & Shipping ID (Pincode) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-700 block mb-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                        Mobile Phone * (10 Digits)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="9876543210"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#F0EFEB] border border-black/10 rounded-xl text-xs sm:text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black font-mono transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-700 block mb-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                        Postal Pincode (Shipping ID) *
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="600001"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#F0EFEB] border border-black/10 rounded-xl text-xs sm:text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black font-mono transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Street Address & Near Place / Landmark for Easy Delivery */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-700 block mb-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                        Street Address * (Door / Flat / Road)
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="No. 42, Haute Avenue"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#F0EFEB] border border-black/10 rounded-xl text-xs sm:text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-700 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                          Near Place / Landmark
                        </label>
                        <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                          Easy Delivery
                        </span>
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="Near Water Tank / Opp. Mall"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#F0EFEB] border border-black/10 rounded-xl text-xs sm:text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 4: City & Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-700 block mb-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                        City *
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Chennai"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#F0EFEB] border border-black/10 rounded-xl text-xs sm:text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-700 block mb-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                        Account Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-9 pr-9 py-2.5 bg-[#F0EFEB] border border-black/10 rounded-xl text-xs sm:text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-neutral-400 hover:text-black cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submit Registration Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-full bg-black text-white font-semibold text-xs uppercase tracking-wider hover:bg-neutral-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing Up...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign Up & Verify</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Register Step 2: OTP Verification */}
              {registerStep === 'otp' && (
                <form onSubmit={handleRegisterVerifyOtp} className="space-y-5 text-center">
                  <div>
                    <h3 className="font-['Conquera',sans-serif] text-xl font-normal uppercase text-black">
                      VERIFY CLIENT EMAIL
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                      Enter the 6-digit confirmation passcode sent to <strong className="text-black">{registerEmail}</strong>
                    </p>
                  </div>

                  <div className="flex justify-center py-2">
                    <OtpInput value={otpCode} onChange={setOtpCode} length={6} autoFocus />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full py-3.5 px-6 rounded-full bg-black text-white font-semibold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Finalizing...</span>
                      </>
                    ) : (
                      <>
                        <span>Activate Account & Proceed</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 font-mono">
                    <button
                      type="button"
                      onClick={() => setRegisterStep('details')}
                      className="hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                      className="hover:text-black transition-colors cursor-pointer disabled:opacity-40"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Bottom Security Footer */}
          <div className="w-full text-center text-[10px] font-mono text-neutral-400 uppercase tracking-widest pt-2">
            CHEM BROS // CASHFREE PG & 256-BIT SSL ENCRYPTED
          </div>
        </div>
      </div>
    </div>
  )
}
