import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProductDetailApi, getProductsApi } from '../services/api'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import bottleImg from '../assets/bottle.png'
import { Loader2 } from 'lucide-react'
import Molt from '../assets/product/molt.jpeg'
import J from '../assets/product/molj.jpeg'
import K from '../assets/product/molr.jpeg'
import X from '../assets/product/discovery.png'

// Placeholders until you plug in your imports above
const DEFAULT_FALLBACK_LANDSCAPE =
  'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1400&q=80'

// =========================================================================
// 2. STATIC DICTIONARY MAPPING EACH PRODUCT SLUG TO ITS LANDSCAPE IMAGE:
// =========================================================================
const LANDSCAPE_MAP: Record<string, string> = {
  // Key matches the product slug (or id as string)
  'molecule-t': Molt, // Replace with landscapeMoleculeT
  'molecule-j': J, // Replace with landscapeMoleculeJ
  'molecule-x': X, // Replace with landscapeMoleculeX
  'molecule-k': K, // Replace with landscapeMoleculeK
  'the-discovery-archive': X, // Replace with landscapeDiscovery
}

interface CustomerReview {
  id: string
  author: string
  location: string
  rating: number
  date: string
  title: string
  comment: string
  longevity: string
  sillage: string
}

const REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'Aarav M.',
    location: 'Bengaluru',
    rating: 5,
    date: 'Verified Buyer · October 2026',
    title: 'Remarkable second-skin evolution',
    comment:
      'The initial spray is bright and crisp, but after an hour it melts into this clean, warm woody aura that projects effortlessly without overwhelming the room.',
    longevity: '11+ Hours',
    sillage: 'Subtle & Radiant',
  },
  {
    id: 'rev-2',
    author: 'Priya S.',
    location: 'Mumbai',
    rating: 5,
    date: 'Verified Buyer · September 2026',
    title: 'Unrivaled oil concentration',
    comment:
      'You can immediately tell this is a real Extrait. One spray on each wrist lasted through an entire humid workday and was still noticeable well into dinner.',
    longevity: '12+ Hours',
    sillage: 'Moderate',
  },
  {
    id: 'rev-3',
    author: 'Karan D.',
    location: 'New Delhi',
    rating: 5,
    date: 'Verified Buyer · October 2026',
    title: 'Clean, modern, and distinct',
    comment:
      'I get stopped constantly by people asking what fragrance I am wearing. Perfectly balanced for all seasons.',
    longevity: '9+ Hours',
    sillage: 'Intimate',
  },
]

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>('30ml Extrait')
  const [isAdded, setIsAdded] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!id) return
      setLoading(true)
      try {
        const [detailData, allProducts] = await Promise.all([
          getProductDetailApi(id),
          getProductsApi(),
        ])

        setProduct(detailData)
        setSelectedSize(detailData.volume_ml ? `${detailData.volume_ml}ml Extrait` : '30ml Extrait')

        if (Array.isArray(allProducts)) {
          const others = allProducts.filter(
            (p) => String(p.id) !== String(detailData.id) && p.slug !== detailData.slug
          )
          setRelatedProducts(others.slice(0, 4))
        }
      } catch (err) {
        console.error('Failed to load product details from database:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
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
    addToCart(product)
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col justify-between">
        <NavBar />
        <div className="w-full flex-1 flex flex-col items-center justify-center py-40">
          <Loader2 className="w-8 h-8 animate-spin text-black mb-4" />
          <p className="text-xs font-mono tracking-widest uppercase text-neutral-400">
            Loading fragrance details...
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col justify-between">
        <NavBar />
        <div className="w-full flex-1 flex flex-col items-center justify-center py-40 text-center px-6">
          <h2 className="text-2xl font-bold font-['Conquera',sans-serif] uppercase tracking-wider text-black">
            Fragrance Not Found
          </h2>
          <p className="text-xs text-neutral-500 mt-2">
            This fragrance may have been archived or is temporarily out of stock.
          </p>
          <Link
            to="/fragrances"
            className="mt-6 px-6 py-2.5 bg-black text-white rounded-full text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all"
          >
            Explore Collection
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const topNotesList = product.top_notes
    ? product.top_notes.split(',').map((s) => s.trim())
    : ['Bergamot', 'Pink Peppercorn', 'Fresh Ozone']
  const heartNotesList = product.heart_notes
    ? product.heart_notes.split(',').map((s) => s.trim())
    : ['Black Tea Steam', 'Orris Root', 'Cashmeran']
  const baseNotesList = product.base_notes
    ? product.base_notes.split(',').map((s) => s.trim())
    : ['Iso E Super', 'Sandalwood', 'Warm Ambroxan']

  // Resolve the product's specific landscape image from our dictionary
  const currentProductKey = (product.slug || String(product.id)).toLowerCase()
  const activeLandscapeImage =
    LANDSCAPE_MAP[currentProductKey] ||
    LANDSCAPE_MAP[String(product.id)] ||
    DEFAULT_FALLBACK_LANDSCAPE

  return (
    <div className="w-full min-h-screen bg-white text-black selection:bg-black selection:text-white flex flex-col justify-between overflow-x-hidden">
      <NavBar />

      <main className="w-full flex flex-col items-center pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        
        {/* =========================================================================
            PART 1: MAIN DETAIL STAGE
            ========================================================================= */}
        <div className="w-full max-w-[1583px] grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 xl:gap-20 items-center">
          
          {/* Left Column: Landscape Frame Showcase Card */}
          <div className="lg:col-span-7 bg-[#F7F9FA] border border-black/5 rounded-[28px] sm:rounded-[36px] lg:rounded-[48px] p-5 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-between relative overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.04)]">
            
            {/* Top Bar: Formulation & Gender */}
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/50 mb-4 sm:mb-6">

              <span>{product.gender || 'Unisex'}</span>
            </div>

            {/* Central Product-Specific Landscape Frame */}
            <div className="w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] rounded-[20px] sm:rounded-[28px] overflow-hidden relative shadow-[0_12px_32px_rgba(0,0,0,0.08)] bg-neutral-200 group">
              <img
                src={activeLandscapeImage}
                alt={`${product.name} Landscape Artwork`}
                draggable={false}
                className="w-full h-full object-cover object-center select-none group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-[9px] sm:text-[10px] font-mono tracking-widest text-white/90 uppercase pointer-events-none">
                <span>{product.name} </span>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 sm:pt-8 mt-5 sm:mt-6 border-t border-black/10 text-center font-mono">
              <div>
                <span className="text-[9px] sm:text-[10px] text-black/40 uppercase block">CONCENTRATION</span>
                <span className="text-[11px] sm:text-xs font-semibold text-black mt-0.5 block uppercase">
                  {product.concentration || '30% Extrait'}
                </span>
              </div>
              <div className="border-x border-black/10">
                <span className="text-[9px] sm:text-[10px] text-black/40 uppercase block">LONGEVITY</span>
                <span className="text-[11px] sm:text-xs font-semibold text-black mt-0.5 block">
                  {product.longevity || '10+ Hours'}
                </span>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] text-black/40 uppercase block">ORIGIN</span>
                <span className="text-[11px] sm:text-xs font-semibold text-black mt-0.5 block">
                  Madurai, IN
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Typography, Notes & Purchase Actions */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 sm:space-y-7 lg:space-y-8">
            
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono tracking-wider text-black/50 uppercase">
              <Link to="/fragrances" className="hover:text-black transition-colors">
                Fragrances
              </Link>
              <span>/</span>
              <span className="text-black font-semibold">{product.name}</span>
            </div>

            {/* Title & Price Header */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal font-['Conquera',sans-serif] tracking-wider uppercase text-black leading-tight">
                {product.name}
              </h1>
              <div className="mt-2.5 sm:mt-3 flex flex-wrap items-baseline gap-3 sm:gap-4 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                <span className="text-2xl sm:text-3xl text-black font-semibold">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] sm:text-xs text-black/50 tracking-wider uppercase">
                  Taxes included · Free express delivery
                </span>
              </div>
            </div>

            {/* Short Narrative Description */}
            <p className="text-xs sm:text-sm lg:text-base text-black/70 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-relaxed">
              {product.description ||
                'A precision-crafted fragrance designed to melt seamlessly with natural body heat, leaving a clean, radiating trail that evolves throughout the day.'}
            </p>

            {/* Fragrance Note Architecture */}
            <div className="p-5 sm:p-6 rounded-[24px] sm:rounded-[28px] bg-black/[0.03] border border-black/5 space-y-3.5">
              <div className="text-[10px] sm:text-[11px] font-mono tracking-widest text-black/50 uppercase">
                FRAGRANCE PROFILE
              </div>

              <div className="space-y-2 text-xs sm:text-[13px] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                <div className="flex items-start gap-2">
                  <span className="w-16 sm:w-20 text-black/40 uppercase font-mono text-[10px] shrink-0 pt-0.5">
                    Top:
                  </span>
                  <span className="text-black font-medium">{topNotesList.join(' · ')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-16 sm:w-20 text-black/40 uppercase font-mono text-[10px] shrink-0 pt-0.5">
                    Heart:
                  </span>
                  <span className="text-black font-medium">{heartNotesList.join(' · ')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-16 sm:w-20 text-black/40 uppercase font-mono text-[10px] shrink-0 pt-0.5">
                    Base:
                  </span>
                  <span className="text-black font-medium">{baseNotesList.join(' · ')}</span>
                </div>
              </div>
            </div>

            {/* Bottle Volume Picker */}
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-black/50 block mb-2.5">
                BOTTLE SIZE
              </span>
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {[selectedSize, 'Discovery Vial (3ml)'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer active:scale-95 ${
                      selectedSize === size
                        ? 'bg-black text-white shadow-md'
                        : 'bg-black/5 hover:bg-black/10 text-black/70'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full sm:flex-1 h-12 sm:h-14 lg:h-16 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 text-black border border-black/10 text-xs sm:text-sm font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] uppercase tracking-wider transition-all duration-300 flex items-center justify-center cursor-pointer"
              >
                {isAdded ? '✓ Added to Cart' : 'Add to Cart'}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full sm:flex-1 h-12 sm:h-14 lg:h-16 rounded-full bg-black hover:bg-neutral-800 active:scale-95 text-white text-xs sm:text-sm font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] uppercase tracking-wider transition-all duration-300 flex items-center justify-center shadow-lg cursor-pointer"
              >
                Buy Now
              </button>
            </div>

          </div>

        </div>

        {/* =========================================================================
            PART 2: VERIFIED REVIEWS & WEAR EXPERIENCES
            ========================================================================= */}
        <section className="w-full max-w-[1583px] mt-20 sm:mt-24 lg:mt-32 pt-12 border-t border-black/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <span className="text-[10px] sm:text-xs font-mono tracking-[0.25em] text-black/50 uppercase block mb-1">
                VERIFIED COMMUNITY
              </span>
              <h2 className="text-2xl sm:text-3xl font-normal font-['Conquera',sans-serif] uppercase tracking-wider text-black">
                CUSTOMER REVIEWS
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-black/70 uppercase">
              <span className="text-amber-400 text-sm">★★★★★</span>
              <span className="font-sans font-semibold">
                {product.rating ? `${product.rating} / 5.0` : '4.9 / 5.0'}
              </span>
              <span className="text-black/40">
                · Based on {product.reviews_count || 38} reviews
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="rounded-[24px] sm:rounded-[32px] p-6 sm:p-7 bg-[#F7F9FA] border border-black/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-black/5 font-mono text-[10px] sm:text-[11px]">
                    <span className="text-black font-bold uppercase">{rev.author} · {rev.location}</span>
                    <span className="text-black/50">{rev.date}</span>
                  </div>

                  <div className="mt-4">
                    <div className="text-amber-400 text-xs mb-2">★★★★★</div>
                    <h3 className="text-sm sm:text-base font-normal font-['Conquera',sans-serif] uppercase tracking-wide text-black leading-snug">
                      "{rev.title}"
                    </h3>
                    <p className="mt-2.5 text-xs sm:text-[13px] text-black/70 leading-relaxed font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                      {rev.comment}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-6 pt-3 border-t border-black/5 font-mono text-[10px]">
                  <div>
                    <span className="text-black/40 uppercase block text-[9px]">LONGEVITY</span>
                    <span className="font-semibold text-black mt-0.5 block">{rev.longevity}</span>
                  </div>
                  <div>
                    <span className="text-black/40 uppercase block text-[9px]">SILLAGE</span>
                    <span className="font-semibold text-black mt-0.5 block">{rev.sillage}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            PART 3: MORE FROM THE COLLECTION (Related Product Grid)
            ========================================================================= */}
        {relatedProducts.length > 0 && (
          <section className="w-full max-w-[1583px] mt-20 sm:mt-24 lg:mt-32 pt-12 border-t border-black/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
              <div>
                <span className="text-[10px] sm:text-xs font-mono tracking-[0.25em] text-black/50 uppercase block mb-1">
                  DISCOVER FURTHER
                </span>
                <h2 className="text-2xl sm:text-3xl font-normal font-['Conquera',sans-serif] uppercase tracking-wider text-black">
                  MORE FROM THE COLLECTION
                </h2>
              </div>
              <Link
                to="/fragrances"
                className="text-xs font-mono tracking-widest text-black/60 hover:text-black uppercase underline transition-colors"
              >
                View All Formulations →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-4 xl:gap-6 justify-items-center">
              {relatedProducts.map((other) => (
                <Link
                  key={other.id}
                  to={`/fragrances/${other.slug || other.id}`}
                  className="w-full max-w-[340px] sm:max-w-none h-[440px] sm:h-[460px] lg:h-[470px] xl:h-[500px] relative rounded-[28px] sm:rounded-[36px] bg-black text-white overflow-hidden flex flex-col justify-between p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_42px_rgba(0,0,0,0.28)] group"
                >
                  <div className="w-full text-center text-white text-xs sm:text-sm lg:text-[13px] xl:text-base font-normal font-['Conquera',sans-serif] tracking-widest uppercase pt-1">
                    {other.name}
                  </div>

                  <div className="my-auto flex items-center justify-center relative w-full h-[180px] sm:h-[200px] lg:h-[210px]">
                    <img
                      src={other.image_base64 || bottleImg}
                      alt={other.name}
                      draggable={false}
                      className="w-auto h-full max-h-[170px] sm:max-h-[190px] lg:max-h-[200px] object-contain drop-shadow-[0_12px_24px_rgba(255,255,255,0.06)] group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
                    />
                  </div>

                  <div className="w-full flex items-center justify-between border-t border-white/10 pt-3">
                    <div className="text-white text-base sm:text-lg font-normal font-['Conquera',sans-serif] tracking-wider">
                      ₹{other.price.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] font-mono uppercase text-white/60 tracking-wider">
                      Explore →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  )
}