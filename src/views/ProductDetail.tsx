'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getProductDetailApi,
  getProductsApi,
  getProductReviewsApi,
  createProductReviewApi,
  getCachedProductsSync,
} from '../services/api'
import type { Product, CustomerReview, CreateReviewInput } from '../types'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { usePlatformSettings } from '../context/PlatformSettingsContext'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'

// Assets - Imported with defensive fallback handling
import bottleImg from '../assets/bottle.png'
import heroBg from '../assets/hero.png'

// Molecule J Imports (4 Images)
import J1 from '../assets/product/molj/J1.png'
import J2 from '../assets/product/molj/J2.png'
import J3 from '../assets/product/molj/J3.jpeg'
import J4 from '../assets/product/molj/J4.png'

// Molecule T Imports (4 Images)
import T1 from '../assets/product/T/T1.png'
import T2 from '../assets/product/T/T2.png'
import T3 from '../assets/product/T/T3.png'
import T4 from '../assets/product/T/T4.png'

// Molecule X Imports (4 Images)
import X1 from '../assets/product/X/X1.png'
import X2 from '../assets/product/X/X2.png'
import X3 from '../assets/product/X/X3.png'
import X4 from '../assets/product/X/X4.png'

// Molecule R Imports (4 Images)
import R1 from '../assets/product/R/R1.png'
import R2 from '../assets/product/R/R2.png'
import R3 from '../assets/product/R/R3.png'
import R4 from '../assets/product/R/R4.png'

// Discovery Archive Imports (Aliased to avoid collision with Molecule T)
import Tetra1 from '../assets/product/tetra/t1.png'
import Tetra2 from '../assets/product/tetra/t2.png'

const resolveAssetSrc = (asset: any, fallback: string = ''): string => {
  if (!asset) return fallback
  if (typeof asset === 'string') return asset
  if (typeof asset === 'object') {
    if (asset.src) return asset.src
    if (asset.default) {
      if (typeof asset.default === 'string') return asset.default
      if (asset.default.src) return asset.default.src
    }
  }
  return fallback
}

const defaultBottle = resolveAssetSrc(bottleImg, '')
const defaultHeroBg = resolveAssetSrc(heroBg, '')

// Resolved Gallery Images
const j1Src = resolveAssetSrc(J1, defaultBottle)
const j2Src = resolveAssetSrc(J2, defaultBottle)
const j3Src = resolveAssetSrc(J3, defaultBottle)
const j4Src = resolveAssetSrc(J4, defaultBottle)

const t1Src = resolveAssetSrc(T1, defaultBottle)
const t2Src = resolveAssetSrc(T2, defaultBottle)
const t3Src = resolveAssetSrc(T3, defaultBottle)
const t4Src = resolveAssetSrc(T4, defaultBottle)

const x1Src = resolveAssetSrc(X1, defaultBottle)
const x2Src = resolveAssetSrc(X2, defaultBottle)
const x3Src = resolveAssetSrc(X3, defaultBottle)
const x4Src = resolveAssetSrc(X4, defaultBottle)

const r1Src = resolveAssetSrc(R1, defaultBottle)
const r2Src = resolveAssetSrc(R2, defaultBottle)
const r3Src = resolveAssetSrc(R3, defaultBottle)
const r4Src = resolveAssetSrc(R4, defaultBottle)

const tetra1Src = resolveAssetSrc(Tetra1, defaultBottle)
const tetra2Src = resolveAssetSrc(Tetra2, defaultBottle)

// ─────────────────────────────────────────────────────────────────────────────
// 5 OFFICIAL PRODUCTS GALLERY MAP
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCT_GALLERY_MAP: Record<string, string[]> = {
  // 1. Molecule J
  'molecule-j': [j1Src, j2Src, j3Src, j4Src],

  // 2. Molecule X
  'molecule-x': [x1Src, x2Src, x3Src, x4Src],

  // 3. Molecule T
  'molecule-t': [t1Src, t2Src, t3Src, t4Src],

  // 4. Molecule R (handles both molecule-r and legacy molecule-k aliases)
  'molecule-r': [r1Src, r2Src, r3Src, r4Src],
  'molecule-k': [r1Src, r2Src, r3Src, r4Src],

  // 5. The Discovery Archive
  'the-discovery-archive': [tetra1Src, tetra2Src],
  'discovery-archive': [tetra1Src, tetra2Src],
}

// Helper to reliably resolve a thumbnail image for "More From the Collection"
const getProductThumbnail = (prod: Product): string => {
  const s = (prod.slug || '').toLowerCase()
  const n = (prod.name || '').toLowerCase()

  if (s.includes('molecule-j') || n.includes('molecule j')) return j1Src
  if (s.includes('molecule-x') || n.includes('molecule x')) return x1Src
  if (s.includes('molecule-t') || n.includes('molecule t')) return t1Src
  if (s.includes('molecule-r') || n.includes('molecule r') || s.includes('molecule-k') || n.includes('molecule k')) return r1Src
  if (s.includes('discovery') || n.includes('discovery') || Boolean(prod.is_archive)) return tetra1Src

  return prod.image_base64 || defaultBottle
}

// Lucide Icons
import {
  Loader2,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Star,
  Truck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { settings } = usePlatformSettings()

  const [product, setProduct] = useState<Product | null>(() => {
    if (!id) return null
    const list = getCachedProductsSync()
    return list?.find((p) => String(p.id) === String(id) || p.slug === String(id)) || null
  })
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [loading, setLoading] = useState(() => {
    if (!id) return true
    const list = getCachedProductsSync()
    return !(list?.some((p) => String(p.id) === String(id) || p.slug === String(id)))
  })
  const [isAdded, setIsAdded] = useState(false)

  // Carousel State
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0)
  const touchStartXRef = useRef<number | null>(null)

  // Review Form States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewAuthor, setReviewAuthor] = useState('')
  const [reviewLocation, setReviewLocation] = useState('')
  const [reviewLongevity, setReviewLongevity] = useState('10+ Hours')
  const [reviewSillage, setReviewSillage] = useState('Moderate and Clean')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewFeedback, setReviewFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!id) return
      setLoading(true)
      try {
        const [detailData, allProducts, reviewsData] = await Promise.all([
          getProductDetailApi(id),
          getProductsApi(),
          getProductReviewsApi(id).catch(() => []),
        ])

        setProduct(detailData)
        setReviews(Array.isArray(reviewsData) ? reviewsData : [])

        if (Array.isArray(allProducts)) {
          // Canonical ordering map for the 5 formulas
          const orderMap: Record<string, number> = {
            'molecule-j': 0,
            'molecule-x': 1,
            'molecule-t': 2,
            'molecule-r': 3,
            'molecule-k': 3,
            'the-discovery-archive': 4,
            'discovery-archive': 4,
          }

          // Filter out the active product by both slug and ID
          const currentSlug = (detailData.slug || '').toLowerCase()
          const currentId = String(detailData.id)

          const others = allProducts.filter((p) => {
            const pSlug = (p.slug || '').toLowerCase()
            const pId = String(p.id)
            return pSlug !== currentSlug && pId !== currentId
          })

          // Sort so J, X, T, R, and Discovery appear in expected order
          others.sort((a, b) => {
            const slugA = (a.slug || '').toLowerCase()
            const slugB = (b.slug || '').toLowerCase()
            const rankA = orderMap[slugA] ?? (a.is_archive ? 4 : 99)
            const rankB = orderMap[slugB] ?? (b.is_archive ? 4 : 99)
            return rankA - rankB
          })

          setRelatedProducts(others.slice(0, 4))
        }
      } catch (err) {
        console.error('Failed to load product details:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    setActiveImageIndex(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addToCart(product)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2500)
  }

  const handleBuyNow = () => {
    if (!product) return
    addToCart(product, 1, false, false)
    navigate('/checkout')
  }

  const handleOpenReviewModal = () => {
    setReviewAuthor(user?.name || '')
    setReviewLocation(user?.city || 'Verified Buyer')
    setReviewRating(5)
    setReviewTitle('')
    setReviewComment('')
    setReviewLongevity('10+ Hours')
    setReviewSillage('Moderate and Clean')
    setReviewFeedback(null)
    setIsReviewModalOpen(true)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    if (!reviewTitle.trim() || !reviewComment.trim() || !reviewAuthor.trim()) {
      setReviewFeedback({
        type: 'error',
        message: 'Please complete your name, headline, and comments.',
      })
      return
    }

    setIsSubmittingReview(true)
    setReviewFeedback(null)

    try {
      const payload: CreateReviewInput = {
        author_name: reviewAuthor.trim(),
        location: reviewLocation.trim() || 'Verified Buyer',
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
        longevity: reviewLongevity,
        sillage: reviewSillage,
      }

      const newReview = await createProductReviewApi(product.id, payload)
      setReviews((prev) => [newReview, ...prev])
      setProduct((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          reviews_count: (prev.reviews_count || 0) + 1,
        }
      })

      setReviewFeedback({
        type: 'success',
        message: 'Your review has been published.',
      })

      setTimeout(() => {
        setIsReviewModalOpen(false)
        setReviewFeedback(null)
      }, 1500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish review.'
      setReviewFeedback({ type: 'error', message: msg })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black mb-3" />
        <p className="text-xs uppercase tracking-widest font-mono">
          Loading...
        </p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-semibold font-['Montserrat',sans-serif] uppercase mb-2">Formulation Not Found</h2>
        <p className="text-sm text-neutral-500 mb-6 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
          The fragrance you are searching for is unavailable.
        </p>
        <Link
          to="/fragrances"
          className="px-8 py-3 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-full hover:bg-neutral-800 transition-all"
        >
          Return to Collection
        </Link>
      </div>
    )
  }

  const lookupSlug = (product.slug || '').toLowerCase()
  const lookupName = (product.name || '').toLowerCase()
  const isArchive =
    Boolean(product.is_archive) ||
    lookupSlug.includes('discovery') ||
    lookupName.includes('discovery')

  // Resolve array of images strictly for the 5 formulas
  const galleryImages: string[] =
    (lookupSlug.includes('molecule-j') || lookupName.includes('molecule j')
      ? PRODUCT_GALLERY_MAP['molecule-j']
      : null) ||
    (lookupSlug.includes('molecule-x') || lookupName.includes('molecule x')
      ? PRODUCT_GALLERY_MAP['molecule-x']
      : null) ||
    (lookupSlug.includes('molecule-t') || lookupName.includes('molecule t')
      ? PRODUCT_GALLERY_MAP['molecule-t']
      : null) ||
    (lookupSlug.includes('molecule-r') || lookupName.includes('molecule r') || lookupSlug.includes('molecule-k') || lookupName.includes('molecule k')
      ? PRODUCT_GALLERY_MAP['molecule-r']
      : null) ||
    (isArchive ? PRODUCT_GALLERY_MAP['the-discovery-archive'] : null) ||
    PRODUCT_GALLERY_MAP[lookupSlug] || [defaultBottle]

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartXRef.current - touchEndX

    if (diff > 45) {
      nextImage()
    } else if (diff < -45) {
      prevImage()
    }
    touchStartXRef.current = null
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center select-none font-['Inter',sans-serif]">
      {/* Top Floating Navigation */}
      <NavBar />

      {/* Main Container */}
      <main className="w-full max-w-[1583px] px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-20 sm:pt-28 pb-16 flex-1 flex flex-col items-center">

        {/* =========================================================================
            PART 1: MAIN HERO CARD (1:1 Carousel Showcase & Purchase Panel)
            ========================================================================= */}
        <div className="w-full bg-[#FAF9F6] border border-black/5 rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] p-5 sm:p-7 lg:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">

          {/* Split Grid */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 xl:gap-12 items-center">

            {/* Left Column: 1:1 Square Carousel with Thumbnail Bar */}
            <div className="lg:col-span-6 w-full max-w-[540px] mx-auto flex flex-col gap-3">

              {/* Main 1:1 Image Carousel Viewport */}
              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="w-full aspect-square rounded-[22px] sm:rounded-[28px] lg:rounded-[34px] overflow-hidden relative border border-black/5 bg-white shadow-xs group"
              >
                {/* Image Slide Track (Edge-to-Edge Fill) */}
                <div
                  className="w-full h-full flex transition-transform duration-500 ease-out will-change-transform"
                  style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
                >
                  {galleryImages.map((src, idx) => (
                    <div key={idx} className="w-full h-full shrink-0 relative bg-white flex items-center justify-center">
                      <img
                        src={src}
                        alt={`${product.name} View ${idx + 1}`}
                        className="w-full h-full object-cover object-center select-none pointer-events-none"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>

                {/* Top Concentration Tag */}
                <div className="absolute top-3.5 left-3.5 sm:top-5 sm:left-5 pointer-events-none z-10">
                  <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md text-black text-[9px] sm:text-[11px] font-mono uppercase tracking-wider sm:tracking-widest border border-black/10 shadow-xs">
                    {product.concentration || (isArchive ? '25% Organic Concentration' : '25% Natural Oil Concentration')}
                  </span>
                </div>

                {/* Left/Right Navigation Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      aria-label="Previous Image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white active:scale-95 text-black shadow-md border border-black/10 backdrop-blur-md flex items-center justify-center transition-all opacity-85 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer z-10"
                    >
                      <ChevronLeft className="w-5 h-5 -ml-0.5" />
                    </button>

                    <button
                      type="button"
                      onClick={nextImage}
                      aria-label="Next Image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white active:scale-95 text-black shadow-md border border-black/10 backdrop-blur-md flex items-center justify-center transition-all opacity-85 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer z-10"
                    >
                      <ChevronRight className="w-5 h-5 -mr-0.5" />
                    </button>
                  </>
                )}

                {/* Bottom Center Indicator Dots */}
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md z-10">
                    {galleryImages.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setActiveImageIndex(dotIdx)}
                        aria-label={`Go to image ${dotIdx + 1}`}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${activeImageIndex === dotIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                          }`}
                      />
                    ))}
                  </div>
                )}

                {/* Bottom Rating Tag */}
                <div className="absolute bottom-3.5 right-3.5 sm:bottom-5 sm:right-5 pointer-events-none z-10">
                  <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-[9px] sm:text-[11px] font-mono flex items-center gap-1.5 shadow-sm">
                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating ? `${product.rating} / 5.0` : '4.95 / 5.0'}</span>
                    <span className="text-white/60">({reviews.length || product.reviews_count || 1})</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Thumbnail Strip */}
              {galleryImages.length > 1 && (
                <div
                  className="w-full grid gap-2 sm:gap-2.5 pt-0.5"
                  style={{
                    gridTemplateColumns: `repeat(${galleryImages.length}, minmax(0, 1fr))`,
                  }}
                >
                  {galleryImages.map((src, thumbIdx) => {
                    const isSelected = activeImageIndex === thumbIdx
                    return (
                      <button
                        key={thumbIdx}
                        type="button"
                        onClick={() => setActiveImageIndex(thumbIdx)}
                        className={`relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer bg-white flex items-center justify-center ${isSelected
                            ? 'border-black ring-2 ring-black/20 shadow-xs scale-[1.02]'
                            : 'border-black/10 opacity-70 hover:opacity-100 hover:border-black/30'
                          }`}
                      >
                        <img
                          src={src}
                          alt={`Thumbnail ${thumbIdx + 1}`}
                          className="w-full h-full object-cover object-center"
                        />
                      </button>
                    )
                  })}
                </div>
              )}

            </div>

            {/* Right Column: Commercial Details & Purchase Panel */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-4 sm:space-y-5 lg:space-y-6">

              {/* Product Header */}
              <div>
                <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-black/50 block mb-1 sm:mb-1.5">
                  EXTRAIT DE PARFUM
                </span>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold font-['Montserrat',sans-serif] tracking-tight text-black leading-[1.08] uppercase">
                  {product.name}
                </h1>

                {product.subtitle && (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-neutral-600 leading-relaxed max-w-lg">
                    {product.subtitle}
                  </p>
                )}

                {product.description && product.description !== product.subtitle && (
                  <p className="mt-2 text-xs sm:text-[13px] text-neutral-600 leading-relaxed max-w-lg">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Price Details */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-black/5 flex items-baseline justify-between shadow-xs">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-0.5">
                    Price
                  </span>
                  <div className="flex items-baseline gap-2 sm:gap-2.5">
                    <span className="text-xl sm:text-2xl font-semibold font-['Montserrat',sans-serif] text-black tracking-tight">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-xs sm:text-sm font-normal font-['Montserrat',sans-serif] text-black/40 line-through">
                        ₹{product.original_price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 uppercase">
                  Inclusive of all taxes (GST)
                </span>
              </div>

              {/* Formulation Specification */}
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-neutral-500 block mb-2">
                  Select Bottle Size
                </span>
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 rounded-full text-xs font-mono tracking-wider uppercase bg-black text-white shadow-xs font-semibold cursor-default">
                    {isArchive ? '4 × 3ml Extrait Archive' : '50ml Signature'}
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full sm:flex-1 py-3.5 sm:py-4 px-6 rounded-2xl bg-white border border-black text-black text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] font-semibold hover:bg-neutral-50 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center shadow-xs"
                >
                  {isAdded ? 'Added to Bag [Confirmed]' : 'Add to Bag'}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full sm:flex-1 py-3.5 sm:py-4 px-6 rounded-2xl bg-black text-white text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] font-semibold hover:bg-neutral-800 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center shadow-md"
                >
                  Buy Now
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-neutral-500 uppercase pt-1">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" /> Free Dispatch Across India
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 10+ Hours Wear Time
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* =========================================================================
            PART 2: CUSTOMER REVIEWS
            ========================================================================= */}
        <section className="w-full mt-12 sm:mt-16 lg:mt-20 pt-8 border-t border-black/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono tracking-[0.25em] text-neutral-400 uppercase block mb-1">
                COMMUNITY FEEDBACK
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold font-['Montserrat',sans-serif] uppercase tracking-tight text-black">
                Customer Reviews
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-black/70">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-semibold text-black">
                  {product.rating ? `${product.rating} / 5.0` : '4.95 / 5.0'}
                </span>
                <span className="text-neutral-400">
                  · Based on {reviews.length || product.reviews_count || 1} review
                </span>
              </div>

              <button
                type="button"
                onClick={handleOpenReviewModal}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-mono tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ml-auto sm:ml-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write a Review</span>
              </button>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="w-full p-10 text-center bg-[#FAF9F6] rounded-3xl border border-black/5">
              <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase">
                No customer reviews published yet for this formulation.
              </p>
              <button
                type="button"
                onClick={handleOpenReviewModal}
                className="mt-4 px-6 py-2.5 bg-black text-white text-xs font-mono tracking-wider uppercase rounded-full hover:bg-neutral-800 transition-all cursor-pointer"
              >
                Be the first to write a review
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {reviews.map((rev) => {
                const authorDisplay = rev.author_name || rev.author || 'Verified Buyer'
                const locationDisplay = rev.location || 'India'
                const dateDisplay = rev.date || (rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Recent Purchase')
                const starCount = Math.max(1, Math.min(5, rev.rating))

                return (
                  <div
                    key={rev.id}
                    className="rounded-3xl p-6 sm:p-7 bg-[#FAF9F6] border border-black/5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-black/5 font-mono text-[11px]">
                        <span className="text-black font-semibold uppercase">{authorDisplay} · {locationDisplay}</span>
                        <span className="text-neutral-400">{dateDisplay}</span>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center gap-0.5 text-amber-400 mb-2">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3.5 h-3.5 ${idx < starCount ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
                            />
                          ))}
                        </div>

                        <h3 className="text-xs sm:text-sm font-semibold font-['Montserrat',sans-serif] uppercase tracking-wide text-black leading-snug">
                          "{rev.title}"
                        </h3>
                        <p className="mt-2 text-xs sm:text-[13px] text-neutral-600 leading-relaxed font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                          {rev.comment}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-6 pt-3 border-t border-black/5 font-mono text-[10px]">
                      <div>
                        <span className="text-neutral-400 uppercase block text-[9px]">WEAR TIME</span>
                        <span className="font-semibold text-black mt-0.5 block">{rev.longevity || '10+ Hours'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 uppercase block text-[9px]">SCENT TRAIL</span>
                        <span className="font-semibold text-black mt-0.5 block">{rev.sillage || 'Clean and Radiant'}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* =========================================================================
    PART 3: MORE FROM THE COLLECTION (Fetching Direct From Backend)
    ========================================================================= */}
        {relatedProducts.length > 0 && (
          <section className="w-full mt-12 sm:mt-16 lg:mt-20 pt-8 border-t border-black/10">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-mono tracking-[0.25em] text-neutral-400 uppercase block mb-1">
                  EXPLORE OTHER SCENTS
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold font-['Montserrat',sans-serif] uppercase tracking-tight text-black">
                  More From the Collection
                </h2>
              </div>
              <Link
                to="/fragrances"
                className="text-xs font-mono tracking-widest text-neutral-600 hover:text-black uppercase underline transition-colors"
              >
                View All Scents &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6 justify-items-center">
              {relatedProducts.map((other) => {
                // Fetch image directly from backend record
                const backendImgSrc =
                  other.image_base64 ||
                  (other as any).image_url ||
                  (other as any).image ||
                  defaultBottle

                return (
                  <Link
                    key={other.id}
                    to={`/fragrances/${other.slug || other.id}`}
                    className="w-full max-w-[175px] sm:max-w-[260px] md:max-w-[310px] lg:max-w-none h-[290px] sm:h-[390px] md:h-[450px] lg:h-[480px] relative rounded-[20px] sm:rounded-[28px] lg:rounded-[36px] bg-white text-black border border-black/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col justify-between p-3.5 sm:p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_42px_rgba(0,0,0,0.08)] hover:border-black/20 group"
                  >
                    {/* Title */}
                    <div className="w-full text-center text-black text-[11px] sm:text-xs md:text-sm font-semibold font-['Montserrat',sans-serif] tracking-tight uppercase pt-0.5 truncate px-1">
                      {other.name}
                    </div>

                    {/* Bottle Image Slot: mix-blend-multiply eliminates the white image box */}
                    <div className="my-auto flex items-center justify-center relative w-full h-[150px] sm:h-[220px] lg:h-[250px] overflow-hidden">
                      <img
                        src={backendImgSrc}
                        alt={other.name}
                        draggable={false}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
                      />
                    </div>

                    {/* Price & Action */}
                    <div className="w-full flex items-center justify-between border-t border-black/[0.08] pt-2.5 pb-0.5">
                      <div className="text-black text-xs sm:text-base font-semibold font-['Montserrat',sans-serif] tracking-tight">
                        ₹{other.price.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-mono uppercase text-black/60 group-hover:text-black tracking-wider transition-colors">
                        Explore &rarr;
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

      </main>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-400 uppercase block mb-1">
                CHEMBROS FRAGRANCE REVIEW
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold font-['Montserrat',sans-serif] uppercase tracking-tight text-black">
                Review Fragrance
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Share your experience wearing <strong className="text-black">{product.name}</strong>.
              </p>
            </div>

            {reviewFeedback && (
              <div
                className={`mt-4 p-3.5 rounded-xl flex items-start gap-2.5 text-xs ${reviewFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
              >
                {reviewFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{reviewFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="mt-6 space-y-4 text-left">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 font-mono">
                  Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-mono text-neutral-500">
                    ({reviewRating} / 5 Stars)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 font-mono">
                  Review Headline *
                </label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Clean, long-lasting scent that turns heads"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 font-mono">
                  Your Wear Experience *
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How does it smell on your skin? How long does it last?"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 font-mono">
                    Observed Wear Time
                  </label>
                  <select
                    value={reviewLongevity}
                    onChange={(e) => setReviewLongevity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="6-8 Hours">6 to 8 Hours</option>
                    <option value="8-10 Hours">8 to 10 Hours</option>
                    <option value="10+ Hours">10+ Hours</option>
                    <option value="All Day Long">All Day Long</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 font-mono">
                    Scent Trail / Sillage
                  </label>
                  <select
                    value={reviewSillage}
                    onChange={(e) => setReviewSillage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="Subtle (Close to Skin)">Subtle (Close to Skin)</option>
                    <option value="Moderate and Clean">Moderate and Clean</option>
                    <option value="Noticeable Aura">Noticeable Aura</option>
                    <option value="Strong Projection">Strong Projection</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 font-mono">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="e.g. Rahul S."
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 font-mono">
                    Location
                  </label>
                  <input
                    type="text"
                    value={reviewLocation}
                    onChange={(e) => setReviewLocation(e.target.value)}
                    placeholder="e.g. Coimbatore or Chennai"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-3.5 px-6 bg-black hover:bg-neutral-800 text-white rounded-2xl text-xs font-medium uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Review...</span>
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}