import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { X, Mail, KeyRound, ArrowRight, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Lock } from 'lucide-react'

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, sendOtp, verifyOtp, loginWithPassword } = useAuth()
  const [mode, setMode] = useState<'otp' | 'admin'>('otp')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devCode, setDevCode] = useState<string | null>(null)

  if (!isAuthModalOpen) return null

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)
    try {
      const res = await sendOtp(email.trim())
      if (res.dev_code) {
        setDevCode(res.dev_code)
      }
      setStep('otp')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode.trim()) return

    setLoading(true)
    setError(null)
    try {
      await verifyOtp(email.trim(), otpCode.trim(), name.trim() || undefined)
      handleClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid verification code.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    setLoading(true)
    setError(null)
    try {
      await loginWithPassword(email.trim(), password)
      handleClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid administrator credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillAdminCredentials = () => {
    setEmail('admin@chembros.com')
    setPassword('Chenbros@tech')
  }

  const handleClose = () => {
    setIsAuthModalOpen(false)
    setStep('email')
    setOtpCode('')
    setPassword('')
    setError(null)
    setDevCode(null)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-6 top-6 p-2 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <p className="text-[10px] tracking-[0.3em] font-semibold text-neutral-500 uppercase font-['Inter',sans-serif]">
            CHEM BROS
          </p>
          <h2 className="text-2xl font-bold font-['Cinzel',serif] text-black mt-1">
            {mode === 'otp' ? 'Sign In / Register' : 'Administrator Sign In'}
          </h2>
          <p className="text-xs text-neutral-500 mt-2 font-['Inter',sans-serif]">
            {mode === 'otp'
              ? step === 'email'
                ? 'Enter your email to receive a secure one-time passcode'
                : `A 6-digit code was dispatched to ${email}`
              : 'Authenticate with master administrator credentials'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-neutral-100 p-1 rounded-full mb-6 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('otp')
              setError(null)
            }}
            className={`flex-1 py-2 rounded-full font-medium transition-all cursor-pointer ${
              mode === 'otp' ? 'bg-white text-black shadow-sm font-semibold' : 'text-neutral-500 hover:text-black'
            }`}
          >
            Email OTP (Client)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('admin')
              setError(null)
              if (!email) setEmail('admin@chembros.com')
            }}
            className={`flex-1 py-2 rounded-full font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'admin' ? 'bg-black text-white shadow-sm font-semibold' : 'text-neutral-500 hover:text-black'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin (Password)
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ADMIN PASSWORD MODE */}
        {mode === 'admin' ? (
          <form onSubmit={handleAdminPasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@chembros.com"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5 uppercase tracking-wider">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={fillAdminCredentials}
                className="text-[11px] text-neutral-600 hover:text-black underline underline-offset-2 cursor-pointer font-medium"
              >
                Auto-fill: admin@chembros.com
              </button>
              <span className="text-[10px] text-neutral-400 font-mono">Role: admin</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-black text-white rounded-xl text-xs font-medium uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating Admin...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Sign In to Admin Console
                </>
              )}
            </button>
          </form>
        ) : step === 'email' ? (
          /* OTP EMAIL INPUT STEP */
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5 uppercase tracking-wider">
                Full Name <span className="text-neutral-400 font-normal lowercase">(optional for registration)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lord / Lady Olfactor"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-black text-white rounded-xl text-xs font-medium uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Dispatching OTP...
                </>
              ) : (
                <>
                  Send Verification Code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* OTP CODE VERIFICATION STEP */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5 uppercase tracking-wider">
                6-Digit Verification Passcode
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-lg font-mono tracking-widest text-center text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>
            </div>

            {devCode && (
              <div className="p-3 bg-neutral-100 rounded-xl text-center text-xs text-neutral-600">
                Testing Code: <span className="font-mono font-bold text-black">{devCode}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-black text-white rounded-xl text-xs font-medium uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Authenticate & Continue
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-xs text-neutral-500 hover:text-black underline underline-offset-4 cursor-pointer"
              >
                Change Email Address
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-4 border-t border-neutral-100 text-center text-[11px] text-neutral-400">
          Secured by Chembros SMTP & JWT Verification.
        </div>
      </div>
    </div>
  )
}
