'use client'
import React, { createContext, useContext, useState, useCallback } from 'react'

interface LoadingContextType {
  isLoading: boolean
  message: string
  submessage: string
  showLoading: (message?: string, submessage?: string) => void
  hideLoading: () => void
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  message: '',
  submessage: '',
  showLoading: () => {},
  hideLoading: () => {},
})

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [submessage, setSubmessage] = useState('')

  const showLoading = useCallback((msg?: string, sub?: string) => {
    if (msg) setMessage(msg)
    if (sub) setSubmessage(sub)
    setIsLoading(true)
  }, [])

  const hideLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        message,
        submessage,
        showLoading,
        hideLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  return useContext(LoadingContext)
}
