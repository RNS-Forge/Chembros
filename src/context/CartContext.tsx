'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Product, CartItem } from '../types'

export interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number, openDrawer?: boolean) => void
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
      rating: p.rating ?? 4.95,
      reviews_count: p.reviews_count ?? 24,
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
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = safeStorage.getItem(CART_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false)

  useEffect(() => {
    try {
      safeStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage error
    }
  }, [items])

  const addToCart = (productInput: Product, quantity = 1, openDrawer = false) => {
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
    if (openDrawer) {
      setIsCartOpen(true)
    }
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
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const shippingFee = subtotal === 0 ? 0 : subtotal >= 1500 ? 0 : 150
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
