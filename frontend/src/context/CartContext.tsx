import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Product, CartItem } from '../types'
import type { FragranceItem } from '../data/fragranceData'

export interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product | FragranceItem, quantity?: number) => void
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

function normalizeProduct(p: Product | FragranceItem): Product {
  if ('title' in p) {
    return {
      id: p.id,
      name: p.title,
      subtitle: p.tagline,
      price: p.price,
      stock: 50,
      category: p.isArchive ? 'Specimen Discovery Set' : 'Extrait de Parfum',
      fragrance_family: p.gender || 'Unisex',
      concentration: p.concentration,
      volume_ml: parseInt(p.volume) || 30,
      top_notes: p.topNotes?.join(', '),
      heart_notes: p.heartNotes?.join(', '),
      base_notes: p.baseNotes?.join(', '),
      description: p.description,
      image_base64: p.image,
      rating: 4.95,
      reviews_count: 24,
      is_trending: true,
      is_featured: true,
      sales_count: 10,
    }
  }
  return p
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false)

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage error
    }
  }, [items])

  const addToCart = (productInput: Product | FragranceItem, quantity = 1) => {
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
    setIsCartOpen(true)
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
