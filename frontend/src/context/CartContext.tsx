import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Product, CartItem } from '../types'

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  subtotal: number
  shippingFee: number
  total: number
  itemCount: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'chembros_cart_items'

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

  const addToCart = (product: Product, quantity = 1) => {
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

  const removeFromCart = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
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
        isCartOpen,
        setIsCartOpen,
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
