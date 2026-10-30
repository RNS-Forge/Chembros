'use client'
import React from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'
import { Plus, Check, Star } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [added, setAdded] = React.useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="group relative bg-white border border-neutral-200/80 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 flex flex-col justify-between">
      {/* Top Meta Tags */}
      <div className="p-5 pb-0 flex items-center justify-between text-[11px] font-['Inter',sans-serif] tracking-wider z-10">
        <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 uppercase font-medium">
          {product.fragrance_family}
        </span>
        <div className="flex items-center gap-1 text-neutral-700">
          <Star className="w-3.5 h-3.5 fill-black text-black" />
          <span className="font-semibold">{product.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Flacon Visual Area */}
      <Link to={`/product/${product.id}`} className="block px-6 py-4 cursor-pointer">
        <div className="w-full h-64 flex items-center justify-center relative overflow-hidden transition-transform duration-500 group-hover:scale-105">
          {product.image_base64 ? (
            <img
              src={product.image_base64}
              alt={product.name}
              className="max-h-full max-w-full object-contain filter drop-shadow-md"
              loading="lazy"
            />
          ) : (
            <div className="w-32 h-44 bg-neutral-100 rounded-lg flex items-center justify-center text-xs text-neutral-400">
              CHEM BROS FLACON
            </div>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-6 pt-2 bg-gradient-to-b from-transparent to-neutral-50/50">
        <div className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-['Inter',sans-serif] mb-1">
          {product.subtitle || `${product.concentration} // ${product.volume_ml} ML`}
        </div>

        <Link to={`/product/${product.id}`} className="group-hover:text-neutral-700 transition-colors">
          <h3 className="font-['Cinzel',serif] text-lg font-bold text-black tracking-wide truncate">
            {product.name}
          </h3>
        </Link>

        {/* Chemical Notes Teaser */}
        <p className="text-xs text-neutral-500 mt-1 line-clamp-1 font-['Inter',sans-serif]">
          {product.top_notes ? `Notes: ${product.top_notes}` : product.description}
        </p>

        {/* Pricing and Action */}
        <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-black font-['Poppins',sans-serif]">
              â‚¹{product.price.toLocaleString('en-IN')}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-neutral-400 line-through">
                â‚¹{product.original_price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              product.stock <= 0
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : added
                ? 'bg-neutral-900 text-white'
                : 'bg-black text-white hover:bg-neutral-800'
            }`}
          >
            {product.stock <= 0 ? (
              'Sold Out'
            ) : added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Add to Bag
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
