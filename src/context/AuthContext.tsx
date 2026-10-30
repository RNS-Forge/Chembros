'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '../types'
import {
  getMeApi,
  sendOtpApi,
  verifyOtpApi,
  loginApi,
  registerApi,
  loginRequestApi,
  verifyLoginOtpApi,
  registerRequestApi,
  verifyRegisterOtpApi,
  updateProfileApi,
  changePasswordApi,
  forgotPasswordRequestApi,
  resetPasswordApi,
} from '../services/api'

export type ProfileTab = 'details' | 'avatar' | 'security' | 'help'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  isAuthModalOpen: boolean
  setIsAuthModalOpen: (open: boolean) => void
  openAuthModal: () => void
  closeAuthModal: () => void
  isProfileModalOpen: boolean
  setIsProfileModalOpen: (open: boolean) => void
  profileActiveTab: ProfileTab
  openProfileModal: (tab?: ProfileTab) => void
  closeProfileModal: () => void
  sendOtp: (email: string) => Promise<{ status: string; message: string }>
  verifyOtp: (email: string, code: string, name?: string) => Promise<User>
  loginRequest: (email: string, password: string) => Promise<{ status: string; message: string; email: string }>
  verifyLoginOtp: (email: string, otp_code: string) => Promise<User>
  registerRequest: (data: {
    email: string
    name?: string
    password?: string
    phone?: string
    shipping_address?: string
    city?: string
    state?: string
    pincode?: string
  }) => Promise<{ status: string; message: string; email: string }>
  verifyRegisterOtp: (data: {
    email: string
    otp_code: string
    name?: string
    password?: string
    phone?: string
    shipping_address?: string
    city?: string
    state?: string
    pincode?: string
  }) => Promise<User>
  forgotPasswordRequest: (email: string) => Promise<{ status: string; message: string; email: string }>
  resetPassword: (email: string, otp_code: string, new_password: string) => Promise<{ status: string; message: string }>
  updateProfile: (data: Partial<User>) => Promise<User>
  changePassword: (current_pass: string, new_pass: string) => Promise<{ status: string; message: string }>
  login: (email: string, password: string) => Promise<User>
  loginWithPassword: (email: string, password: string) => Promise<User>
  register: (data: {
    name: string
    email: string
    password: string
    phone?: string
    shipping_address?: string
    city?: string
    state?: string
    pincode?: string
  }) => Promise<User>
  logout: () => void
}

const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, value)
    } catch {}
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch {}
  },
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = safeStorage.getItem('chembros_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => safeStorage.getItem('chembros_token'))
  const [isLoading, setIsLoading] = useState<boolean>(!user && !!token)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false)
  const [profileActiveTab, setProfileActiveTab] = useState<ProfileTab>('details')

  const setUserAndStore = (u: User | null) => {
    setUser(u)
    if (u) {
      safeStorage.setItem('chembros_user', JSON.stringify(u))
    } else {
      safeStorage.removeItem('chembros_user')
    }
  }

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await getMeApi()
          setUserAndStore(profile)
        } catch {
          // If token completely invalid or expired, clear
          if (!user) {
            safeStorage.removeItem('chembros_token')
            safeStorage.removeItem('chembros_user')
            setToken(null)
            setUser(null)
          }
        }
      } else {
        safeStorage.removeItem('chembros_user')
        setUser(null)
      }
      setIsLoading(false)
    }
    loadUser()
  }, [token])

  const openProfileModal = (tab: ProfileTab = 'details') => {
    setProfileActiveTab(tab)
    setIsProfileModalOpen(true)
  }

  const closeProfileModal = () => {
    setIsProfileModalOpen(false)
  }

  const loginRequest = async (email: string, password: string) => {
    return await loginRequestApi(email, password)
  }

  const verifyLoginOtp = async (email: string, otp_code: string): Promise<User> => {
    const res = await verifyLoginOtpApi(email, otp_code)
    safeStorage.setItem('chembros_token', res.access_token)
    setToken(res.access_token)
    setUserAndStore(res.user)
    setIsAuthModalOpen(false)
    return res.user
  }

  const registerRequest = async (data: {
    email: string
    name?: string
    password?: string
    phone?: string
    shipping_address?: string
    city?: string
    state?: string
    pincode?: string
  }) => {
    return await registerRequestApi(data)
  }

  const verifyRegisterOtp = async (data: {
    email: string
    otp_code: string
    name?: string
    password?: string
    phone?: string
    shipping_address?: string
    city?: string
    state?: string
    pincode?: string
  }) => {
    const res = await verifyRegisterOtpApi(data)
    safeStorage.setItem('chembros_token', res.access_token)
    setToken(res.access_token)
    setUserAndStore(res.user)
    setIsAuthModalOpen(false)
    return res.user
  }

  const updateProfile = async (data: Partial<User>): Promise<User> => {
    const updated = await updateProfileApi(data)
    setUserAndStore(updated)
    return updated
  }

  const changePassword = async (current_pass: string, new_pass: string) => {
    return await changePasswordApi(current_pass, new_pass)
  }

  const forgotPasswordRequest = async (email: string) => {
    return await forgotPasswordRequestApi(email)
  }

  const resetPassword = async (email: string, otp_code: string, new_password: string) => {
    return await resetPasswordApi({ email, otp_code, new_password })
  }

  const sendOtp = async (email: string) => {
    return await sendOtpApi(email)
  }

  const verifyOtp = async (email: string, code: string, name?: string): Promise<User> => {
    const res = await verifyOtpApi(email, code, name)
    safeStorage.setItem('chembros_token', res.access_token)
    setToken(res.access_token)
    setUserAndStore(res.user)
    setIsAuthModalOpen(false)
    return res.user
  }

  const login = async (email: string, password: string): Promise<User> => {
    const res = await loginApi(email, password)
    safeStorage.setItem('chembros_token', res.access_token)
    setToken(res.access_token)
    setUserAndStore(res.user)
    setIsAuthModalOpen(false)
    return res.user
  }

  const register = async (data: {
    name: string
    email: string
    password: string
    phone?: string
    shipping_address?: string
    city?: string
    state?: string
    pincode?: string
  }): Promise<User> => {
    const res = await registerApi(data)
    safeStorage.setItem('chembros_token', res.access_token)
    setToken(res.access_token)
    setUserAndStore(res.user)
    setIsAuthModalOpen(false)
    return res.user
  }

  const logout = () => {
    safeStorage.removeItem('chembros_token')
    safeStorage.removeItem('chembros_user')
    setToken(null)
    setUser(null)
    setIsProfileModalOpen(false)
  }

  const isAdmin = user?.role === 'admin'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isProfileModalOpen,
        setIsProfileModalOpen,
        profileActiveTab,
        openProfileModal,
        closeProfileModal,
        sendOtp,
        verifyOtp,
        loginRequest,
        verifyLoginOtp,
        registerRequest,
        verifyRegisterOtp,
        forgotPasswordRequest,
        resetPassword,
        updateProfile,
        changePassword,
        login,
        loginWithPassword: login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
