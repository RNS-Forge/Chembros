'use client'

import React from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import SmoothScroll from '@/components/SmoothScroll'
import CartDrawer from '@/components/CartDrawer'
import AuthModal from '@/components/AuthModal'
import ProfileModal from '@/components/ProfileModal'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <SmoothScroll>
          <div className="w-full min-h-screen bg-white text-black selection:bg-neutral-200 overflow-x-clip font-['Inter',sans-serif]">
            {/* Global Slide-out Bag, Auth & Profile Modals */}
            <CartDrawer />
            <AuthModal />
            <ProfileModal />
            {children}
          </div>
        </SmoothScroll>
      </CartProvider>
    </AuthProvider>
  )
}

