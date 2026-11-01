'use client'
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import FullPageLoader from '../components/FullPageLoader'

interface LoadingContextType {
  isLoading: boolean
  message: string
  submessage: string
  showLoading: (message?: string, submessage?: string) => void
  hideLoading: () => void
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  message: 'MOLECULAR SYNTHESIS IN PROGRESS',
  submessage: 'Where Molecular Chemistry Meets Haute Parfumerie',
  showLoading: () => {},
  hideLoading: () => {},
})

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [manualLoading, setManualLoading] = useState(false)
  const [autoLoading, setAutoLoading] = useState(false)
  const [message, setMessage] = useState('MOLECULAR SYNTHESIS IN PROGRESS')
  const [submessage, setSubmessage] = useState('Where Molecular Chemistry Meets Haute Parfumerie')

  const pendingRequestsRef = useRef(0)
  const autoLoadingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const showLoading = useCallback((msg?: string, sub?: string) => {
    if (msg) setMessage(msg)
    if (sub) setSubmessage(sub)
    setManualLoading(true)
  }, [])

  const hideLoading = useCallback(() => {
    setManualLoading(false)
  }, [])

  // Auto-listen to API requests taking longer than 250ms
  useEffect(() => {
    const handleApiStart = (e: Event) => {
      pendingRequestsRef.current += 1
      const customEvent = e as CustomEvent<{ endpoint?: string }>
      const endpoint = customEvent.detail?.endpoint || ''

      // Set contextual message if suitable
      if (endpoint.includes('/orders') || endpoint.includes('/checkout')) {
        setMessage('SECURING ORDER ALLOCATIONS...')
        setSubmessage('Connecting to laboratory dispatch registry')
      } else if (endpoint.includes('/auth') || endpoint.includes('/login') || endpoint.includes('/register')) {
        setMessage('AUTHENTICATING CLIENT VAULT...')
        setSubmessage('Verifying laboratory security credentials')
      } else if (endpoint.includes('/profile')) {
        setMessage('SYNTHESIZING CLIENT PROFILE...')
        setSubmessage('Updating verified delivery coordinates')
      } else {
        setMessage('MOLECULAR SYNTHESIS IN PROGRESS...')
        setSubmessage('Where Molecular Chemistry Meets Haute Parfumerie')
      }

      // Debounce auto loading: only show full-screen molecular synthesis loader
      // if an operation is actually taking more than 500ms (e.g. cold-start or slow network).
      // Fast operations (< 500ms) resolve instantly without any jarring flicker or screen takeover.
      if (!autoLoadingTimerRef.current) {
        autoLoadingTimerRef.current = setTimeout(() => {
          if (pendingRequestsRef.current > 0) {
            setAutoLoading(true)
          }
        }, 500)
      }
    }

    const handleApiEnd = () => {
      pendingRequestsRef.current = Math.max(0, pendingRequestsRef.current - 1)
      if (pendingRequestsRef.current === 0) {
        if (autoLoadingTimerRef.current) {
          clearTimeout(autoLoadingTimerRef.current)
          autoLoadingTimerRef.current = null
        }
        setAutoLoading(false)
      }
    }

    window.addEventListener('chembros:api-start', handleApiStart)
    window.addEventListener('chembros:api-end', handleApiEnd)

    return () => {
      window.removeEventListener('chembros:api-start', handleApiStart)
      window.removeEventListener('chembros:api-end', handleApiEnd)
      if (autoLoadingTimerRef.current) {
        clearTimeout(autoLoadingTimerRef.current)
      }
    }
  }, [])

  const isVisible = manualLoading || autoLoading

  return (
    <LoadingContext.Provider
      value={{
        isLoading: isVisible,
        message,
        submessage,
        showLoading,
        hideLoading,
      }}
    >
      {children}
      {isVisible && (
        <FullPageLoader message={message} submessage={submessage} fullscreen={true} />
      )}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  return useContext(LoadingContext)
}

