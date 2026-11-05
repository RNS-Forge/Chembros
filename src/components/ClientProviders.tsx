'use client'

import React from 'react'
import { PlatformSettingsProvider } from '@/context/PlatformSettingsContext'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { LoadingProvider } from '@/context/LoadingContext'
import SmoothScroll from '@/components/SmoothScroll'
import CartDrawer from '@/components/CartDrawer'
import AuthModal from '@/components/AuthModal'
import ProfileModal from '@/components/ProfileModal'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LoadingProvider>
      <PlatformSettingsProvider>
        <AuthProvider>
          <CartProvider>
            <SmoothScroll>
              <div
                suppressHydrationWarning
                className="w-full min-h-screen bg-white text-black selection:bg-neutral-200 overflow-x-clip font-['Inter',sans-serif]"
              >
                {/* Global Slide-out Bag, Auth & Profile Modals */}
                <CartDrawer />
                <AuthModal />
                <ProfileModal />
                {children}
              </div>
            </SmoothScroll>
          </CartProvider>
        </AuthProvider>
      </PlatformSettingsProvider>
    </LoadingProvider>
  )
}
