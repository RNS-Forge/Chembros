import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'
import type { Product } from '../types'
import { getProductDetailApi, getProductRecommendationsApi } from '../services/api'
import { useCart } from '../context/CartContext'
import { Star, ShieldCheck, Truck, RotateCcw, Plus, Minus, Check, Beaker, Sparkles, Loader2, ArrowLeft } from 'lucide-react'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const { addToCart } = useCart()

  useEffect(() => {
    async function loadData() {
      if (!id) return
      setLoading(true)
      try {
        const prod = await getProductDetailApi(Number(id))
        setProduct(prod)
        const recs = await getProductRecommendationsApi(Number(id), 4)
        setRecommendations(recs)
      } catch (err) {
        console.error('Failed to load fragrance detail:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black mb-3" />
        <p className="text-xs tracking-widest uppercase font-['Inter',sans-serif]">Synthesizing Flacon Details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-['Cinzel',serif] text-2xl font-bold text-black">Flacon Not Found</h2>
        <p className="text-xs text-neutral-500 mt-2 mb-6">The fragrance formulation you requested is unavailable or archived.</p>
        <Link to="/fragrances" className="px-6 py-2.5 bg-black text-white rounded-full text-xs uppercase tracking-widest">
          Browse Catalog
        </Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center">
      {/* Top Floating Navigation */}
      <div className="w-full flex justify-center pt-8 pb-6 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <NavBar />
      </div>

      <main className="w-full max-w-[1576px] px-6 py-8 flex-1">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/fragrances"
            className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-black transition-colors font-['Inter',sans-serif]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Fragrances
          </Link>
        </div>

        {/* Product Presentation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Flacon Artwork Viewer */}
          <div className="bg-neutral-50/80 border border-neutral-200/80 rounded-3xl p-12 flex items-center justify-center min-h-[540px] relative overflow-hidden shadow-sm">
            {/* Subtle background spotlight */}
            <div className="absolute inset-0 bg-radial from-neutral-200/40 via-transparent to-transparent pointer-events-none" />

            {product.image_base64 ? (
              <img
                src={product.image_base64}
                alt={product.name}
                className="max-h-[460px] max-w-full object-contain filter drop-shadow-2xl transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="w-48 h-72 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400 font-mono text-sm">
                CHEM BROS FLACON
              </div>
            )}

            <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-neutral-200 text-[10px] tracking-widest font-semibold uppercase text-neutral-800">
              {product.fragrance_family}
            </div>
          </div>

          {/* Right: Formulation Details & Purchase */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 text-xs text-neutral-500 font-['Inter',sans-serif] tracking-widest uppercase">
                <span>{product.subtitle || `${product.concentration} // ${product.volume_ml} ML`}</span>
                <span>•</span>
                <div className="flex items-center gap-1 text-black font-semibold">
                  <Star className="w-3.5 h-3.5 fill-black" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-neutral-400 font-normal">({product.reviews_count} reviews)</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold font-['Cinzel',serif] text-black mt-2 tracking-wide">
                {product.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl md:text-3xl font-bold text-black font-['Poppins',sans-serif]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm text-neutral-400 line-through">
                    ₹{product.original_price.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
                  Inclusive of all taxes
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-600 leading-relaxed font-['Inter',sans-serif]">
              {product.description}
            </p>

            {/* Olfactory Note Pyramid */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-black flex items-center gap-2">
                <Beaker className="w-4 h-4 text-neutral-600" />
                Olfactory Note Architecture
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-neutral-200/60">
                  <span className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                    Top // Opening (0-30m)
                  </span>
                  <p className="text-neutral-800 font-medium">
                    {product.top_notes || 'Molecular Aldehydes'}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-neutral-200/60">
                  <span className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                    Heart // Identity (1-5h)
                  </span>
                  <p className="text-neutral-800 font-medium">
                    {product.heart_notes || 'Extracted Petals & Resins'}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-neutral-200/60">
                  <span className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                    Base // Tenacity (6-16h)
                  </span>
                  <p className="text-neutral-800 font-medium">
                    {product.base_notes || 'Heavy Fixing Polymers'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stock & Volume Spec */}
            <div className="flex items-center gap-4 text-xs">
              <div className="px-4 py-2 rounded-xl bg-neutral-100 font-medium text-neutral-700">
                Volume: <strong>{product.volume_ml} ML</strong>
              </div>
              <div className="px-4 py-2 rounded-xl bg-neutral-100 font-medium text-neutral-700">
                Concentration: <strong>{product.concentration}</strong>
              </div>
              <div className="text-xs">
                {product.stock > 10 ? (
                  <span className="text-emerald-700 font-medium">In Stock & Ready for Dispatch</span>
                ) : product.stock > 0 ? (
                  <span className="text-amber-700 font-medium">Limited Inventory: {product.stock} units left</span>
                ) : (
                  <span className="text-red-600 font-medium">Currently Sold Out</span>
                )}
              </div>
            </div>

            {/* Quantity and Add to Bag */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border border-neutral-300 rounded-full bg-neutral-50 px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-neutral-500 hover:text-black cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-semibold text-black">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="p-2 text-neutral-500 hover:text-black cursor-pointer disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 py-4 px-8 rounded-full text-xs font-medium uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-black/10 ${
                  product.stock <= 0
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : added
                    ? 'bg-neutral-900 text-white'
                    : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                {product.stock <= 0 ? (
                  'Out of Stock'
                ) : added ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Bag
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add to Collection • ₹{(product.price * quantity).toLocaleString('en-IN')}
                  </>
                )}
              </button>
            </div>

            {/* Luxury Assurances */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-100 text-[11px] text-neutral-500 font-['Inter',sans-serif]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-neutral-700 shrink-0" />
                <span>Complimentary Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-neutral-700 shrink-0" />
                <span>Authentic Formulation</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-neutral-700 shrink-0" />
                <span>Sample Included</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Recommendation Engine Section */}
        {recommendations.length > 0 && (
          <section className="mt-32 pt-16 border-t border-neutral-200">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-neutral-500 font-['Inter',sans-serif] flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-black" />
                Olfactory Chemistry Engine
              </span>
              <h2 className="text-3xl font-bold font-['Cinzel',serif] text-black mt-2">
                Resonant Formulations
              </h2>
              <p className="text-xs text-neutral-600 mt-2 font-['Inter',sans-serif]">
                Fragrances that share molecular kinship and harmonious olfactory notes with {product.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recommendations.map((rec) => (
                <ProductCard key={rec.id} product={rec} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
