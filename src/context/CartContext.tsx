'use client'
import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { Check, X } from 'lucide-react'
import type { Product, CartItem } from '../types'
import { useAuth } from './AuthContext'
import { usePlatformSettings } from './PlatformSettingsContext'

export interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number, openDrawer?: boolean, showToast?: boolean) => void
  removeFromCart: (productId: number | string) => void
  updateQuantity: (productId: number | string, quantity: number) => void
  clearCart: () => void
  subtotal: number
  shippingFee: number
  total: number
  itemCount: number
  totalItems: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'chembros_cart_items'
const GUEST_CART_KEY = 'chembros_guest_cart'
const getUserCartKey = (userId: number | string) => `chembros_user_cart_${userId}`

function normalizeProduct(p: any): Product {
  if (p && 'title' in p && !p.name) {
    return {
      ...p,
      name: p.title,
      subtitle: p.tagline || p.subtitle,
      price: Number(p.price) || 0,
      stock: p.stock ?? 50,
      category: p.category || (p.is_archive ? 'Specimen Discovery Set' : 'Extrait de Parfum'),
      fragrance_family: p.fragrance_family || p.gender || 'Unisex',
      concentration: p.concentration || '30% Extrait',
      volume_ml: p.volume_ml || (parseInt(p.volume) || 30),
      top_notes: Array.isArray(p.topNotes) ? p.topNotes.join(', ') : p.top_notes,
      heart_notes: Array.isArray(p.heartNotes) ? p.heartNotes.join(', ') : p.heart_notes,
      base_notes: Array.isArray(p.baseNotes) ? p.baseNotes.join(', ') : p.base_notes,
      description: p.description,
      image_base64: p.image || p.image_base64,
      rating: p.rating ?? 0,
      reviews_count: p.reviews_count ?? 0,
      is_trending: p.is_trending ?? true,
      is_featured: p.is_featured ?? true,
      sales_count: p.sales_count ?? 10,
    }
  }
  return {
    ...p,
    price: Number(p.price) || 0,
    stock: p.stock ?? 50,
  }
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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const { settings } = usePlatformSettings()
  const previousUserIdRef = useRef<number | string | null>(null)
  const isInitialMount = useRef(true)
  const hasLoadedFromStorage = useRef(false)
  const [items, setItems] = useState<CartItem[]>([])

  // Load saved cart from localStorage only after client mounts to prevent SSR hydration mismatch
  useEffect(() => {
    try {
      const guestSaved = safeStorage.getItem(GUEST_CART_KEY)
      if (guestSaved) {
        const parsed = JSON.parse(guestSaved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed)
          hasLoadedFromStorage.current = true
          return
        }
      }
      const saved = safeStorage.getItem(CART_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch (e) {
      console.warn('Failed to load cart from storage:', e)
    } finally {
      hasLoadedFromStorage.current = true
    }
  }, [])
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false)
  const [cartToast, setCartToast] = useState<{
    id: number
    productName: string
    productImage?: string
    quantity: number
  } | null>(null)
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  // Automatic Cart Merging & Syncing when user signs in
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      if (isAuthenticated && user?.id) {
        previousUserIdRef.current = user.id
        mergeOrLoadUserCart(user.id)
      }
      return
    }

    if (isAuthenticated && user?.id) {
      if (previousUserIdRef.current !== user.id) {
        previousUserIdRef.current = user.id
        mergeOrLoadUserCart(user.id)
      }
    } else if (!isAuthenticated) {
      previousUserIdRef.current = null
    }
  }, [isAuthenticated, user?.id])

  const mergeOrLoadUserCart = (userId: number | string) => {
    try {
      // 1. Read guest items from guest cart storage (or current state)
      const guestSaved = safeStorage.getItem(GUEST_CART_KEY)
      let guestItems: CartItem[] = []
      if (guestSaved) {
        try {
          const parsed = JSON.parse(guestSaved)
          if (Array.isArray(parsed)) guestItems = parsed
        } catch {}
      }
      if (guestItems.length === 0 && items.length > 0) {
        const userSavedCheck = safeStorage.getItem(getUserCartKey(userId))
        if (!userSavedCheck) {
          guestItems = [...items]
        }
      }

      // 2. Read existing saved cart for this logged-in account
      const userKey = getUserCartKey(userId)
      const userSaved = safeStorage.getItem(userKey)
      let userItems: CartItem[] = []
      if (userSaved) {
        try {
          const parsed = JSON.parse(userSaved)
          if (Array.isArray(parsed)) userItems = parsed
        } catch {}
      }

      // 3. If there are guest items, merge into user's account cart
      if (guestItems.length > 0) {
        const merged: CartItem[] = [...userItems]
        for (const gItem of guestItems) {
          const existingIdx = merged.findIndex((it) => it.product.id === gItem.product.id)
          if (existingIdx > -1) {
            const maxStock = gItem.product.stock || 50
            merged[existingIdx].quantity = Math.min(
              maxStock,
              merged[existingIdx].quantity + gItem.quantity
            )
          } else {
            merged.push(gItem)
          }
        }
        // Save merged cart to user account key & general storage
        safeStorage.setItem(userKey, JSON.stringify(merged))
        safeStorage.setItem(CART_STORAGE_KEY, JSON.stringify(merged))
        // Clear guest cart key so it doesn't duplicate
        safeStorage.removeItem(GUEST_CART_KEY)
        setItems(merged)
      } else if (userItems.length > 0) {
        // Restore user's saved account cart
        safeStorage.setItem(CART_STORAGE_KEY, JSON.stringify(userItems))
        setItems(userItems)
      }
    } catch (e) {
      console.warn('Error syncing cart on sign in:', e)
    }
  }

  // Persist items whenever items change (only after initial load)
  useEffect(() => {
    if (!hasLoadedFromStorage.current) return
    try {
      safeStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      if (isAuthenticated && user?.id) {
        safeStorage.setItem(getUserCartKey(user.id), JSON.stringify(items))
      } else {
        safeStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
      }
    } catch {}
  }, [items, isAuthenticated, user?.id])

  const addToCart = (productInput: Product, quantity = 1, openDrawer = false, showToast = true) => {
    const product = normalizeProduct(productInput)
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id)
      if (existingIndex > -1) {
        const updated = [...prev]
        updated[existingIndex].quantity = Math.min(
          product.stock,
          updated[existingIndex].quantity + quantity
        )
        return updated
      } else {
        return [...prev, { product, quantity: Math.min(product.stock, quantity) }]
      }
    })

    if (showToast) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      setCartToast({
        id: Date.now(),
        productName: product.name,
        productImage: product.image_base64 || (product as any).image,
        quantity,
      })
      toastTimerRef.current = setTimeout(() => {
        setCartToast(null)
      }, 3500)
    }

    if (openDrawer) {
      setIsCartOpen(true)
    }
  }

  const dismissToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setCartToast(null)
  }

  const removeFromCart = (productId: number | string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const updateQuantity = (productId: number | string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.min(item.product.stock, quantity) }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    setItems([])
    safeStorage.removeItem(CART_STORAGE_KEY)
    if (isAuthenticated && user?.id) {
      safeStorage.removeItem(getUserCartKey(user.id))
    } else {
      safeStorage.removeItem(GUEST_CART_KEY)
    }
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  // Delivery fee fixed/managed by admin per product
  const defaultFee = typeof settings?.default_delivery_fee === 'number' ? settings.default_delivery_fee : 100
  const freeThreshold = typeof settings?.free_shipping_threshold === 'number' ? settings.free_shipping_threshold : 1500
  const freeEnabled = settings?.enable_free_shipping !== false

  const hasCustomDeliveryFees = items.some((it) => typeof it.product.delivery_fee === 'number' && it.product.delivery_fee > 0)

  const shippingFee = items.length === 0
    ? 0
    : hasCustomDeliveryFees
      ? items.reduce((sum, it) => {
          const fee = typeof it.product.delivery_fee === 'number' && it.product.delivery_fee > 0
            ? it.product.delivery_fee
            : (freeEnabled && subtotal >= freeThreshold ? 0 : defaultFee)
          return sum + fee * it.quantity
        }, 0)
      : (freeEnabled && subtotal >= freeThreshold ? 0 : defaultFee)

  const total = subtotal + shippingFee
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        shippingFee,
        total,
        itemCount,
        totalItems: itemCount,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}

      {/* Floating "Item added to cart" feedback notification */}
      {cartToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-4 sm:right-6 z-[999] max-w-sm w-[calc(100vw-2rem)] sm:w-auto bg-black text-white p-3 sm:p-3.5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] border border-white/15 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300 pointer-events-auto select-none"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {cartToast.productImage ? (
              <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
                <img
                  src={cartToast.productImage}
                  alt={cartToast.productName}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div className="text-[8px] text-white tracking-wide font-['Montserrat',sans-serif]">
                  Added to cart
                </div>
              </div>
              <p className="text-[11px] text-neutral-300 truncate max-w-[180px] sm:max-w-[210px] font-medium">
                {cartToast.productName} {cartToast.quantity > 1 ? `(×${cartToast.quantity})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            <button
              type="button"
              onClick={() => {
                dismissToast()
                setIsCartOpen(true)
              }}
              className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              View Bag
            </button>
            <button
              type="button"
              onClick={dismissToast}
              className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
