'use client'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react'
import bottleImg from '../assets/bottle.png'

const defaultBottleImg = (bottleImg as any)?.src || bottleImg

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal, shippingFee, total } = useCart()
  const { isAuthModalOpen } = useAuth()
  const navigate = useNavigate()

  if (!isCartOpen || isAuthModalOpen) return null

  return (
    <div className="fixed inset-0 z-[500] overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-6 py-6 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h2 className="text-lg font-bold font-['Cinzel',serif] tracking-wider text-black">
                Your Selection
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Progress */}
          <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-100 text-xs text-neutral-600">
            {subtotal >= 1500 ? (
              <span className="text-emerald-700 font-medium">
                Complimentary white-glove shipping unlocked!
              </span>
            ) : (
              <span>
                Add <strong className="text-black font-semibold">â‚¹{(1500 - subtotal).toLocaleString('en-IN')}</strong> more for complimentary delivery.
              </span>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-400">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="font-['Cinzel',serif] text-base font-bold text-neutral-800">Your flacon collection is empty</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs font-['Inter',sans-serif]">
                  Discover the exquisite chemistry of our concentrated extraits.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false)
                    navigate('/fragrances')
                  }}
                  className="mt-6 px-6 py-2.5 bg-black text-white rounded-full text-xs font-medium uppercase tracking-widest hover:bg-neutral-800 transition-all cursor-pointer"
                >
                  Explore Fragrances
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div key={product.id} className="py-4 flex gap-4 items-center">
                  {/* Flacon Base64 Thumbnail */}
                  <div className="w-20 h-24 bg-neutral-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1.5 border border-neutral-200">
                    <img
                      src={product.image_base64 || defaultBottleImg}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-['Cinzel',serif] font-bold text-sm text-black truncate">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-['Inter',sans-serif]">
                      {product.subtitle || `${product.concentration} // ${product.volume_ml}ml`}
                    </p>
                    <p className="text-xs font-semibold text-neutral-900 mt-1">
                      â‚¹{product.price.toLocaleString('en-IN')}
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 mt-2.5">
                      <div className="flex items-center border border-neutral-300 rounded-full bg-neutral-50">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 hover:text-black text-neutral-500 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-medium text-black">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="p-1 hover:text-black text-neutral-500 transition-colors cursor-pointer disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-neutral-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 space-y-3">
              <div className="flex justify-between text-xs text-neutral-600">
                <span>Subtotal</span>
                <span>â‚¹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-600">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'Complimentary' : `â‚¹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-neutral-200">
                <span>Total</span>
                <span>â‚¹{total.toLocaleString('en-IN')}</span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false)
                  navigate('/checkout')
                }}
                className="w-full mt-2 py-3.5 px-4 bg-black text-white rounded-full text-xs font-medium uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer shadow-lg shadow-black/10"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
