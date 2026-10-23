import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '../types'
import { getMeApi, sendOtpApi, verifyOtpApi, adminLoginApi } from '../services/api'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  isAuthModalOpen: boolean
  setIsAuthModalOpen: (open: boolean) => void
  sendOtp: (email: string) => Promise<{ status: string; message: string; dev_code?: string }>
  verifyOtp: (email: string, code: string, name?: string) => Promise<void>
  loginWithPassword: (email: string, password: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('chembros_token'))
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await getMeApi()
          setUser(profile)
        } catch {
          // Token expired or invalid
          localStorage.removeItem('chembros_token')
          setToken(null)
          setUser(null)
        }
      }
      setIsLoading(false)
    }
    loadUser()
  }, [token])

  const sendOtp = async (email: string) => {
    return await sendOtpApi(email)
  }

  const verifyOtp = async (email: string, code: string, name?: string) => {
    const res = await verifyOtpApi(email, code, name)
    localStorage.setItem('chembros_token', res.access_token)
    setToken(res.access_token)
    setUser(res.user)
    setIsAuthModalOpen(false)
  }

  const loginWithPassword = async (email: string, password: string): Promise<User> => {
    const res = await adminLoginApi(email, password)
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
        sendOtp,
        verifyOtp,
        loginWithPassword,
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
