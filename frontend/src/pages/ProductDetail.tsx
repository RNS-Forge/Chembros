import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProductDetailApi, getProductsApi, getProductReviewsApi, createProductReviewApi } from '../services/api'
import type { Product, CustomerReview, CreateReviewInput } from '../types'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import bottleImg from '../assets/bottle.png'
import { Loader2, Plus, X, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>('30ml Extrait')
  const [isAdded, setIsAdded] = useState(false)

  // Review Form States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewAuthor, setReviewAuthor] = useState('')
  const [reviewLocation, setReviewLocation] = useState('')
  const [reviewLongevity, setReviewLongevity] = useState('11+ Hours')
  const [reviewSillage, setReviewSillage] = useState('Subtle & Radiant')
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
        setSelectedSize(detailData.volume_ml ? `${detailData.volume_ml}ml Extrait` : '30ml Extrait')
        setReviews(Array.isArray(reviewsData) ? reviewsData : [])

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

  const handleOpenReviewModal = () => {
    setReviewAuthor(user?.name || '')
    setReviewLocation(user?.city || 'Verified Buyer')
    setReviewRating(5)
    setReviewTitle('')
    setReviewComment('')
    setReviewLongevity('11+ Hours')
    setReviewSillage('Subtle & Radiant')
    setReviewFeedback(null)
    setIsReviewModalOpen(true)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    if (!reviewTitle.trim() || !reviewComment.trim() || !reviewAuthor.trim()) {
      setReviewFeedback({
        type: 'error',
        message: 'Please complete your name, review headline, and wear experience.'
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

      // Add to dynamic reviews list
      setReviews((prev) => [newReview, ...prev])

      // Update product counters dynamically
      setProduct((prev) => {
        if (!prev) return prev
        const updatedCount = (prev.reviews_count || 0) + 1
        return {
          ...prev,
          reviews_count: updatedCount,
        }
      })

      setReviewFeedback({
        type: 'success',
        message: 'Your wear experience has been added to the customer reviews archive.'
      })

      setTimeout(() => {
        setIsReviewModalOpen(false)
        setReviewFeedback(null)
      }, 1500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish review. Please try again.'
      setReviewFeedback({ type: 'error', message: msg })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black mb-3" />
        <p className="text-xs uppercase tracking-widest font-['Inter',sans-serif]">
          Loading Olfactory Formulation...
        </p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold font-['Cinzel',serif] mb-2">Formulation Not Found</h2>
        <p className="text-sm text-neutral-500 mb-6">
          The requested fragrance does not exist in our olfactory database.
        </p>
        <Link
          to="/fragrances"
          className="px-6 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-full"
        >
          Return to Fragrances
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center selection:bg-black selection:text-white">
      {/* Top Floating Navigation */}
      <div className="w-full flex justify-center pt-8 pb-6 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <NavBar />
      </div>

      <main className="w-full max-w-[1583px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex-1 flex flex-col items-center">

        {/* =========================================================================
            PART 1: MAIN HERO CARD (Split 50/50 Canvas)
            ========================================================================= */}
        <div className="w-full h-auto min-h-[600px] lg:h-[750px] xl:h-[790px] rounded-[32px] sm:rounded-[40px] lg:rounded-[48px] bg-[#F7F9FA] border border-black/5 flex flex-col lg:flex-row overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]">

          {/* LEFT COLUMN: Clean White Sanctuary for Flacon (50%) */}
          <div className="w-full lg:w-1/2 h-[380px] sm:h-[480px] lg:h-full relative flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-hidden bg-white/60">

            {/* Subtle radial ambient glow behind the bottle */}
            <div className="absolute w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] rounded-full bg-gradient-to-tr from-black/[0.04] to-transparent blur-3xl pointer-events-none" />

            {/* Hero Fragrance Flacon */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <img
                src={product.image_base64 || bottleImg}
                alt={product.name}
                draggable={false}
                className="w-auto h-auto max-h-[300px] sm:max-h-[380px] lg:max-h-[480px] xl:max-h-[520px] object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.14)] transition-transform duration-700 hover:scale-[1.03] select-none pointer-events-none"
              />
            </div>

            {/* Editorial Badge (Bottom Left of Canvas) */}
            <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 flex flex-col gap-0.5 pointer-events-none z-10">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-black/50 uppercase">
                FORMULATION REF
              </span>
              <span className="text-xs sm:text-sm font-['Cinzel',serif] tracking-wider text-black font-semibold">
                {product.code || `CB-${String(product.id).padStart(3, '0')}`}
              </span>
            </div>

            {/* Concentration Tag (Top Left) */}
            <div className="absolute top-6 left-6 sm:top-8 sm:left-8 pointer-events-none z-10">
              <span className="px-3 py-1 rounded-full bg-black/5 backdrop-blur-sm text-[10px] font-mono uppercase tracking-widest text-black/70">
                {product.concentration || '30% Pure Extrait'}
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Editorial Data & Bespoke Acquisition Panel (50%) */}
          <div className="w-full lg:w-1/2 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 bg-[#F7F9FA]">

            {/* Top Meta & Title */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase text-black/40">
                  {product.fragrance_family || 'WOODY'} · {product.category || 'EXTRAIT DE PARFUM'}
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-black/60">
                  ★ {product.rating ? `${product.rating} / 5.0` : '4.9 / 5.0'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal font-['Conquera',sans-serif] uppercase tracking-wide text-black leading-[1.08]">
                {product.name}
              </h1>

              {product.subtitle && (
                <p className="mt-2 text-xs sm:text-sm font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-black/60 tracking-wide">
                  {product.subtitle}
                </p>
              )}

              {/* Price Row */}
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-normal font-['Conquera',sans-serif] text-black tracking-tight">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm sm:text-base font-normal font-['Conquera',sans-serif] text-black/40 line-through">
                    ₹{product.original_price.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-[11px] font-mono text-black/50 ml-1">
                  · Inclusive of all luxury duties & taxes
                </span>
              </div>

              {/* Size / Flacon Selection */}
              <div className="mt-8">
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-black/50 block mb-2.5">
                  FLACON APERTURE
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {['30ml Extrait', '50ml Signature', '100ml Flacon Privé'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-black text-white shadow-sm'
                          : 'bg-white text-black/70 border border-black/10 hover:border-black/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Olfactory Formulation Pyramid */}
              <div className="mt-8 pt-6 border-t border-black/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-black/40 block mb-1">
                    TOP APERTURE
                  </span>
                  <p className="text-xs font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-black leading-snug">
                    {product.top_notes || 'Italian Bergamot, Pink Peppercorn'}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-black/40 block mb-1">
                    HEART CHORD
                  </span>
                  <p className="text-xs font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-black leading-snug">
                    {product.heart_notes || 'Iris Pallida, Smoked Cardamom'}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-black/40 block mb-1">
                    BASE RESIDUE
                  </span>
                  <p className="text-xs font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-black leading-snug">
                    {product.base_notes || 'Virginian Cedarwood, Clean Ambergris'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Acquisition Buttons */}
            <div className="mt-10 pt-6 border-t border-black/10 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full sm:flex-1 py-4 px-6 rounded-full bg-white border border-black text-black text-xs font-mono uppercase tracking-[0.2em] font-semibold hover:bg-black/5 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
              >
                {isAdded ? 'Added to Bag ✓' : 'Add to Bag'}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full sm:flex-1 py-4 px-6 rounded-full bg-black text-white text-xs font-mono uppercase tracking-[0.2em] font-semibold hover:bg-black/85 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center shadow-md"
              >
                Acquire Now
              </button>
            </div>

          </div>

        </div>

        {/* =========================================================================
            PART 2: VERIFIED REVIEWS & WEAR EXPERIENCES (Dynamic Database)
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
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-black/70 uppercase">
                <span className="text-amber-400 text-sm">★★★★★</span>
                <span className="font-sans font-semibold">
                  {product.rating ? `${product.rating} / 5.0` : '4.9 / 5.0'}
                </span>
                <span className="text-black/40">
                  · Based on {reviews.length || product.reviews_count || 0} reviews
                </span>
              </div>
              <button
                type="button"
                onClick={handleOpenReviewModal}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-mono tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ml-auto sm:ml-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Review
              </button>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="w-full p-12 text-center bg-[#F7F9FA] rounded-[32px] border border-black/5">
              <p className="text-xs font-mono tracking-widest text-black/50 uppercase">
                No customer experiences recorded yet for this bespoke formulation.
              </p>
              <button
                type="button"
                onClick={handleOpenReviewModal}
                className="mt-4 px-6 py-2.5 bg-black text-white text-xs font-mono tracking-wider uppercase rounded-full hover:bg-neutral-800 transition-all cursor-pointer"
              >
                Be the first to review
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {reviews.map((rev) => {
                const authorDisplay = rev.author_name || rev.author || 'Verified Collector'
                const locationDisplay = rev.location || 'Verified Buyer'
                const dateDisplay = rev.date || (rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Verified Buyer')
                const stars = '★'.repeat(Math.max(1, Math.min(5, rev.rating))) + '☆'.repeat(Math.max(0, 5 - rev.rating))

                return (
                  <div
                    key={rev.id}
                    className="rounded-[24px] sm:rounded-[32px] p-6 sm:p-7 bg-[#F7F9FA] border border-black/5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-black/5 font-mono text-[10px] sm:text-[11px]">
                        <span className="text-black font-bold uppercase">{authorDisplay} · {locationDisplay}</span>
                        <span className="text-black/50">{dateDisplay}</span>
                      </div>

                      <div className="mt-4">
                        <div className="text-amber-400 text-xs mb-2 tracking-widest">{stars}</div>
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
                        <span className="font-semibold text-black mt-0.5 block">{rev.longevity || '10+ Hours'}</span>
                      </div>
                      <div>
                        <span className="text-black/40 uppercase block text-[9px]">SILLAGE</span>
                        <span className="font-semibold text-black mt-0.5 block">{rev.sillage || 'Subtle & Radiant'}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* =========================================================================
            ADD REVIEW LUXURY MODAL
            ========================================================================= */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-lg bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-400 uppercase block mb-1">
                  CHEMBROS ATELIER
                </span>
                <h3 className="text-xl sm:text-2xl font-['Cinzel',serif] font-bold text-black uppercase">
                  Add Formulation Review
                </h3>
                <p className="text-xs text-neutral-500 mt-1 font-['Inter',sans-serif]">
                  Sharing verified wear impressions for: <strong className="text-black">{product.name}</strong>
                </p>
              </div>

              {reviewFeedback && (
                <div
                  className={`mt-4 p-3.5 rounded-xl flex items-start gap-2.5 text-xs ${
                    reviewFeedback.type === 'success'
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
                {/* Rating Stars Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Rating Evaluation
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="text-2xl transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                      >
                        <span className={star <= reviewRating ? 'text-amber-400' : 'text-neutral-300'}>
                          ★
                        </span>
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-mono text-neutral-500">
                      ({reviewRating} / 5 Stars)
                    </span>
                  </div>
                </div>

                {/* Review Headline */}
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Unrivaled second-skin evolution"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                {/* Wear Impressions Comment */}
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Wear Experience &amp; Notes
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe how the formulation projects, longevity, and your olfactory experience throughout the day..."
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black leading-relaxed"
                  />
                </div>

                {/* Longevity & Sillage Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Observed Longevity
                    </label>
                    <select
                      value={reviewLongevity}
                      onChange={(e) => setReviewLongevity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="6-8 Hours">6-8 Hours</option>
                      <option value="8-10 Hours">8-10 Hours</option>
                      <option value="11+ Hours">11+ Hours</option>
                      <option value="14+ Hours (All-Day)">14+ Hours (All-Day)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Projection / Sillage
                    </label>
                    <select
                      value={reviewSillage}
                      onChange={(e) => setReviewSillage(e.target.value)}
                      className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="Intimate">Intimate (Skin Scent)</option>
                      <option value="Subtle & Radiant">Subtle &amp; Radiant</option>
                      <option value="Moderate">Moderate Aura</option>
                      <option value="Enveloping">Enveloping &amp; Magnetic</option>
                    </select>
                  </div>
                </div>

                {/* Author Name & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      placeholder="e.g. Aarav M."
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={reviewLocation}
                      onChange={(e) => setReviewLocation(e.target.value)}
                      placeholder="e.g. Mumbai or Bengaluru"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-3.5 px-6 bg-black text-white rounded-xl text-xs font-semibold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmittingReview ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Publishing to Archive...
                      </>
                    ) : (
                      'Publish Verified Review'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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