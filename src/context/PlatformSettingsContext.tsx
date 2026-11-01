'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { PlatformSettings } from '../types'
import { DEFAULT_PLATFORM_SETTINGS } from '../types'
import { getPlatformSettingsApi, updatePlatformSettingsApi } from '../services/api'

interface PlatformSettingsContextType {
  settings: PlatformSettings
  isLoading: boolean
  updateSettings: (newSettings: Partial<PlatformSettings>) => Promise<PlatformSettings>
  resetSettings: () => Promise<PlatformSettings>
}

const PlatformSettingsContext = createContext<PlatformSettingsContextType>({
  settings: DEFAULT_PLATFORM_SETTINGS,
  isLoading: false,
  updateSettings: async () => DEFAULT_PLATFORM_SETTINGS,
  resetSettings: async () => DEFAULT_PLATFORM_SETTINGS,
})

export function PlatformSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial settings
  useEffect(() => {
    let isMounted = true
    getPlatformSettingsApi()
      .then((loaded) => {
        if (isMounted) {
          setSettings(loaded)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false)
      })

    // Listen to real-time update events across components and tabs
    const handleSettingsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<PlatformSettings>
      if (customEvent.detail) {
        setSettings(customEvent.detail)
      }
    }

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'chembros_platform_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          setSettings((prev) => ({ ...prev, ...parsed }))
        } catch {}
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('chembros_settings_updated', handleSettingsUpdated)
      window.addEventListener('storage', handleStorageEvent)
    }

    return () => {
      isMounted = false
      if (typeof window !== 'undefined') {
        window.removeEventListener('chembros_settings_updated', handleSettingsUpdated)
        window.removeEventListener('storage', handleStorageEvent)
      }
    }
  }, [])

  const updateSettings = useCallback(async (newSettings: Partial<PlatformSettings>): Promise<PlatformSettings> => {
    setIsLoading(true)
    try {
      const updated = await updatePlatformSettingsApi(newSettings)
      setSettings(updated)
      return updated
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetSettings = useCallback(async (): Promise<PlatformSettings> => {
    setIsLoading(true)
    try {
      const res = await updatePlatformSettingsApi(DEFAULT_PLATFORM_SETTINGS)
      setSettings(res)
      return res
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <PlatformSettingsContext.Provider value={{ settings, isLoading, updateSettings, resetSettings }}>
      {children}
    </PlatformSettingsContext.Provider>
  )
}

export function usePlatformSettings() {
  const context = useContext(PlatformSettingsContext)
  if (!context) {
    throw new Error('usePlatformSettings must be used within a PlatformSettingsProvider')
  }
  return context
}

