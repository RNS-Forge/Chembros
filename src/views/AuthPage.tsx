'use client'
import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import OtpInput from '../components/OtpInput'
import whiteLogo from '../assets/cmlogo.png'
import darkLogo from '../assets/blacklogo.png'
import bottleImg from '../assets/bottle.png'

const defaultBottle = (bottleImg as any)?.src || bottleImg
const defaultLogo = (darkLogo as any)?.src || (whiteLogo as any)?.src || darkLogo

import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  ArrowLeft,
  KeyRound,
  Home,
  CheckCircle2,
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

  // Tabs: 'signin' | 'register'
  const initialTab = searchParams.get('mode') === 'register' ? 'register' : 'signin'
  const [tab, setTab] = useState<'signin' | 'register'>(initialTab)

  // Steps
  const [signInStep, setSignInStep] = useState<'credentials' | 'otp' | 'forgot_request' | 'forgot_verify'>('credentials')
  const [registerStep, setRegisterStep] = useState<'details' | 'otp'>('details')

  // Form Fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [name, setName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')

  // Password Recovery Fields
  const [forgotOtp, setForgotOtp] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')

  // UI Toggles & Feedback
  const [otpCode, setOtpCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [useOtpLogin, setUseOtpLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  const redirectUrl = searchParams.get('redirect')

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

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleTabChange = (newTab: 'signin' | 'register') => {
    setTab(newTab)
    setError(null)
    setSuccessMsg(null)
    setOtpCode('')
    setSignInStep('credentials')
    setRegisterStep('details')
  }

  // 1. Sign In
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
        setSuccessMsg(`A 6-digit access code was sent to ${loginEmail.trim().toLowerCase()}.`)
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
      setError(err instanceof Error ? err.message : 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Sign In OTP
  const handleSignInVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.trim().length !== 6) {
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
      setError(err instanceof Error ? err.message : 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  // 3. Forgot Password Request
  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim()) {
      setError('Please enter your registered email address.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await forgotPasswordRequest(loginEmail.trim().toLowerCase())
      setSignInStep('forgot_verify')
      setResendCooldown(60)
      setSuccessMsg(`Reset code sent to ${loginEmail.trim().toLowerCase()}.`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send reset code.')
    } finally {
      setLoading(false)
    }
  }

  // 4. Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (forgotOtp.trim().length !== 6) {
      setError('Please enter the 6-digit code.')
      return
    }
    if (forgotNewPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await resetPassword(loginEmail.trim().toLowerCase(), forgotOtp.trim(), forgotNewPassword)
      setSuccessMsg('Password updated successfully. Please sign in.')
      setSignInStep('credentials')
      setLoginPassword('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  // 5. Minimal Sign Up (Name, Email, Phone, Password)
  const handleRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!registerEmail.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!phone.trim() || phone.trim().length !== 10) {
      setError('Please enter a valid 10-digit mobile number.')
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
      await registerRequest({
        name: name.trim(),
        email: registerEmail.trim().toLowerCase(),
        phone: phone.trim(),
        password: registerPassword,
      })
      setRegisterStep('otp')
      setResendCooldown(45)
      setSuccessMsg(`Verification code sent to ${registerEmail.trim().toLowerCase()}.`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. This email may already exist.')
    } finally {
      setLoading(false)
    }
  }

  // 6. Sign Up OTP
  const handleRegisterVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const newUser = await verifyRegisterOtp({
        email: registerEmail.trim().toLowerCase(),
        otp_code: otpCode.trim(),
        name: name.trim(),
        phone: phone.trim(),
        password: registerPassword,
      })
      if (newUser.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (redirectUrl) {
        navigate(redirectUrl, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid verification code.')
    } finally {
      setLoading(false)
    }
  }

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
          phone: phone.trim(),
          password: registerPassword,
        })
      }
      setSuccessMsg('A new verification code has been sent.')
      setResendCooldown(45)
    } catch {
      setError('Failed to resend code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#FBFBF9] text-black flex flex-col items-center justify-center p-4 sm:p-6 relative select-none font-['Inter',sans-serif]">
      {/* Return Home Header Action */}
      <Link
        to="/"
        className="absolute top-5 left-5 sm:top-8 sm:left-8 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Back to Store</span>
      </Link>

      {/* Main Luxury Auth Card */}
      <div className="w-full max-w-[440px] bg-white border border-black/5 rounded-[28px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.04)] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link to="/" className="inline-block mb-3">
            <img src={defaultLogo} alt="Chembros" className="h-6 w-auto object-contain" />
          </Link>
          <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-400 uppercase">
            CHEMBROS HAUTE PARFUMERIE
          </span>
        </div>

        {/* Minimal Tab Switcher */}
        <div className="flex p-1 bg-neutral-100 rounded-full mb-6">
          <button
            type="button"
            onClick={() => handleTabChange('signin')}
            className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider rounded-full transition-all cursor-pointer ${
              tab === 'signin' ? 'bg-white text-black shadow-xs font-semibold' : 'text-neutral-500 hover:text-black'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider rounded-full transition-all cursor-pointer ${
              tab === 'register' ? 'bg-white text-black shadow-xs font-semibold' : 'text-neutral-500 hover:text-black'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && !error && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 1. SIGN IN FLOW                                               */}
        {/* ───────────────────────────────────────────────────────────── */}
        {tab === 'signin' && (
          <div>
            {signInStep === 'credentials' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50/80 border border-neutral-200 rounded-xl text-xs text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                    />
                  </div>
                </div>

                {!useOtpLogin && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-600">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => { setSignInStep('forgot_request'); setError(null); }}
                        className="text-[11px] font-mono text-neutral-400 hover:text-black underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-neutral-50/80 border border-neutral-200 rounded-xl text-xs text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
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

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => { setUseOtpLogin(!useOtpLogin); setError(null); }}
                    className="text-xs text-neutral-500 hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer font-mono"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{useOtpLogin ? 'Use password instead' : 'Sign in with One-Time Email Code'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-black hover:bg-neutral-800 text-white font-medium text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{useOtpLogin ? 'Send Code' : 'Sign In'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {signInStep === 'otp' && (
              <form onSubmit={handleSignInVerifyOtp} className="space-y-4 text-center">
                <div>
                  <h3 className="font-['Conquera',sans-serif] text-sm uppercase tracking-wider text-black">
                    Enter Verification Code
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Sent to <strong className="text-black font-mono">{loginEmail}</strong>
                  </p>
                </div>

                <div className="flex justify-center py-2">
                  <OtpInput value={otpCode} onChange={setOtpCode} length={6} autoFocus />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3.5 px-6 rounded-2xl bg-black hover:bg-neutral-800 text-white font-medium text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify & Continue</span>}
                </button>

                <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 font-mono">
                  <button
                    type="button"
                    onClick={() => setSignInStep('credentials')}
                    className="hover:text-black flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Change email</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="hover:text-black cursor-pointer disabled:opacity-40"
                  >
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}

            {signInStep === 'forgot_request' && (
              <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                <div>
                  <h3 className="font-['Conquera',sans-serif] text-sm uppercase tracking-wider text-black">
                    Reset Password
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Enter your email address and we'll send a 6-digit recovery code.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
                    Account Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-200 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-black hover:bg-neutral-800 text-white font-medium text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Recovery Code</span>}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setSignInStep('credentials')}
                    className="text-xs font-mono text-neutral-400 hover:text-black cursor-pointer"
                  >
                    Cancel and Return
                  </button>
                </div>
              </form>
            )}

            {signInStep === 'forgot_verify' && (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <h3 className="font-['Conquera',sans-serif] text-sm uppercase tracking-wider text-black">
                    New Password
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Enter code sent to <strong className="text-black font-mono">{loginEmail}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                    6-Digit Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-center text-xs font-mono tracking-widest text-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-black hover:bg-neutral-800 text-white font-medium text-xs uppercase tracking-[0.2em] transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Password</span>}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 2. MINIMAL SIGN UP FLOW (NO ADDRESS INPUTS)                   */}
        {/* ───────────────────────────────────────────────────────────── */}
        {tab === 'register' && (
          <div>
            {registerStep === 'details' && (
              <form onSubmit={handleRegisterRequest} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Gowtham A"
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/80 border border-neutral-200 rounded-xl text-xs text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/80 border border-neutral-200 rounded-xl text-xs text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1">
                    Mobile Number * (10 Digits)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/80 border border-neutral-200 rounded-xl text-xs font-mono text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 bg-neutral-50/80 border border-neutral-200 rounded-xl text-xs text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-neutral-400 hover:text-black cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 leading-normal pt-1">
                  By continuing, you agree to Chembros' Terms of Service and Privacy Policy. Delivery addresses are added at checkout.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-black hover:bg-neutral-800 text-white font-medium text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {registerStep === 'otp' && (
              <form onSubmit={handleRegisterVerifyOtp} className="space-y-4 text-center">
                <div>
                  <h3 className="font-['Conquera',sans-serif] text-sm uppercase tracking-wider text-black">
                    Verify Your Email
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    We sent a 6-digit code to <strong className="text-black font-mono">{registerEmail}</strong>
                  </p>
                </div>

                <div className="flex justify-center py-2">
                  <OtpInput value={otpCode} onChange={setOtpCode} length={6} autoFocus />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3.5 px-6 rounded-2xl bg-black hover:bg-neutral-800 text-white font-medium text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
                </button>

                <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 font-mono">
                  <button
                    type="button"
                    onClick={() => setRegisterStep('details')}
                    className="hover:text-black flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Edit details</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="hover:text-black cursor-pointer disabled:opacity-40"
                  >
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Minimal Footer */}
        <div className="mt-8 pt-4 border-t border-black/5 text-center text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
          CHEMBROS // SECURE 256-BIT ENCRYPTION
        </div>

      </div>
    </div>
  )
}