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
  changePasswordApi
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
  sendOtp: (email: string) => Promise<{ status: string; message: string; dev_code?: string }>
  verifyOtp: (email: string, code: string, name?: string) => Promise<User>
  loginRequest: (email: string, password: string) => Promise<{ status: string; message: string; email: string }>
  verifyLoginOtp: (email: string, otp_code: string) => Promise<User>
  registerRequest: (data: {
    name: string
    email: string
    password: string
    phone?: string
    shipping_address?: string
    city?: string
    state?: string
    pincode?: string
  }) => Promise<{ status: string; message: string; email: string }>
  verifyRegisterOtp: (data: {
    name: string
    email: string
    password: string
    phone?: string
    shipping_address?: string
    city?: string
    state?: string
    pincode?: string
    otp_code: string
  }) => Promise<User>
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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('chembros_token'))
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false)
  const [profileActiveTab, setProfileActiveTab] = useState<ProfileTab>('details')

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await getMeApi()
          setUser(profile)
        } catch {
          localStorage.removeItem('chembros_token')
          setToken(null)
          setUser(null)
        }
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
    localStorage.setItem('chembros_token', res.access_token)
    setToken(res.access_token)
    setUser(res.user)
    setIsAuthModalOpen(false)
    return res.user
  }

  const registerRequest = async (data: {
    name: string
    email: string
    password: string
    phone?: string
    shipping_address?: string
    city?: string
    state?: string
    pincode?: string
  }) => {
    return await registerRequestApi(data)
  }

  const verifyRegisterOtp = async (data: {
    name: string
    email: string
    password: string
    phone?: string
    shipping_address?: string
    city?: string
    state?: string
    pincode?: string
    otp_code: string
  }) => {
    const res = await verifyRegisterOtpApi(data)
    localStorage.setItem('chembros_token', res.access_token)
    setToken(res.access_token)
    setUser(res.user)
    setIsAuthModalOpen(false)
    return res.user
  }

  const updateProfile = async (data: Partial<User>): Promise<User> => {
    const updated = await updateProfileApi(data)
    setUser(updated)
    return updated
  }

  const changePassword = async (current_pass: string, new_pass: string) => {
    return await changePasswordApi(current_pass, new_pass)
  }

  const sendOtp = async (email: string) => {
    return await sendOtpApi(email)
  }

  const verifyOtp = async (email: string, code: string, name?: string): Promise<User> => {
    const res = await verifyOtpApi(email, code, name)
    localStorage.setItem('chembros_token', res.access_token)
    setToken(res.access_token)
    setUser(res.user)
    setIsAuthModalOpen(false)
    return res.user
  }

  const login = async (email: string, password: string): Promise<User> => {
    const res = await loginApi(email, password)
    localStorage.setItem('chembros_token', res.access_token)
    setToken(res.access_token)
    setUser(res.user)
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
    localStorage.setItem('chembros_token', res.access_token)
    setToken(res.access_token)
    setUser(res.user)
    setIsAuthModalOpen(false)
    return res.user
  }

  const logout = () => {
    localStorage.removeItem('chembros_token')
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
