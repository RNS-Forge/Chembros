import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProductDetailApi } from '../services/api'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import bottleImg from '../assets/bottle.png'
import { Loader2 } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>('30ml Extrait')
  const [isAdded, setIsAdded] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      if (!id) return
      setLoading(true)
      try {
        const data = await getProductDetailApi(id)
        setProduct(data)
        setSelectedSize(data.volume_ml ? `${data.volume_ml}ml Extrait` : '30ml Extrait')
      } catch (err) {
        console.error('Failed to load product from live database:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
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
            Decanting Formulation from Laboratory Database...
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
          <h2 className="text-2xl font-bold font-['Cinzel',serif] text-black">Formulation Not Found</h2>
          <p className="text-xs text-neutral-500 mt-2">This bespoke flacon may have been archived or retired.</p>
          <Link
            to="/fragrances"
            className="mt-6 px-6 py-2.5 bg-black text-white rounded-full text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all"
          >
            Explore Catalog
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const topNotesList = product.top_notes
    ? product.top_notes.split(',').map((s) => s.trim())
    : ['Green Cardamom', 'Pink Peppercorn']
  const heartNotesList = product.heart_notes
    ? product.heart_notes.split(',').map((s) => s.trim())
    : ['Fractional Orris', 'Cashmeran']
  const baseNotesList = product.base_notes
    ? product.base_notes.split(',').map((s) => s.trim())
    : ['Australian Sandalwood', 'Iso E Super']

  return (
    <div className="w-full min-h-screen bg-white text-black selection:bg-black selection:text-white flex flex-col justify-between">
      <NavBar />

      <main className="w-full flex justify-center items-center pt-32 pb-24 px-6 lg:px-16">
        <div className="w-full max-w-[1576px] grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Big Frosted Specimen Card with Image */}
          <div className="lg:col-span-7 bg-[#F7F9FA] border border-black/5 rounded-[50px] p-10 sm:p-16 flex flex-col justify-between relative overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.04)]">
            
            {/* Top Tag */}
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-black/50">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                SPECIMEN // {product.code || `0${product.id}`}
              </span>
              <span>{product.gender || 'Unisex'}</span>
            </div>

            {/* Central Bottle Display */}
            <div className="my-14 flex items-center justify-center relative">
              <div className="w-80 h-80 rounded-full bg-black/5 blur-3xl absolute -z-10" />
              <img
                src={product.image_base64 || bottleImg}
                alt={product.name}
                draggable={false}
                className="w-80 sm:w-96 max-h-[500px] object-contain select-none drop-shadow-[0_25px_40px_rgba(0,0,0,0.18)] hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Monograph Spec Strip */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-black/10 text-center font-mono">
              <div>
                <span className="text-[10px] text-black/40 uppercase block">CONCENTRATION</span>
                <span className="text-xs font-semibold text-black mt-1 block uppercase">
                  {product.concentration || '30% EXTRAIT'}
                </span>
              </div>
              <div className="border-x border-black/10">
                <span className="text-[10px] text-black/40 uppercase block">LONGEVITY</span>
                <span className="text-xs font-semibold text-black mt-1 block">
                  {product.longevity || '10+ Hours'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-black/40 uppercase block">DISPATCH</span>
                <span className="text-xs font-semibold text-black mt-1 block">READY LAB BATCH</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Typography, Notes, and Buying Controls */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
            
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-black/50 uppercase">
              <Link to="/fragrances" className="hover:text-black transition-colors">
                Fragrances
              </Link>
              <span>/</span>
              <span className="text-black font-semibold">{product.name}</span>
            </div>

            {/* Title & Price Header */}
            <div>
              <h1 className="text-4xl sm:text-5xl font-normal font-['Conquera',sans-serif] tracking-wider uppercase text-black leading-tight">
                {product.name}
              </h1>
              <div className="mt-3 flex items-baseline gap-4 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                <span className="text-3xl text-black font-semibold">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-black/50 tracking-wider uppercase">
                  Taxes included · Free express shipping
                </span>
              </div>
            </div>

            {/* Monograph Description */}
            <p className="text-sm sm:text-base text-black/70 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-relaxed">
              {product.description}
            </p>

            {/* Olfactory Notes Architecture */}
            <div className="p-6 rounded-[28px] bg-black/[0.03] border border-black/5 space-y-4">
              <div className="text-[11px] font-mono tracking-widest text-black/50 uppercase">
                OLFACTORY NOTE PYRAMID
              </div>

              <div className="space-y-2.5 text-xs font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                <div className="flex items-start">
                  <span className="w-20 text-black/40 uppercase font-mono text-[10px]">Top:</span>
                  <span className="text-black font-medium">{topNotesList.join(' · ')}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-20 text-black/40 uppercase font-mono text-[10px]">Heart:</span>
                  <span className="text-black font-medium">{heartNotesList.join(' · ')}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-20 text-black/40 uppercase font-mono text-[10px]">Base:</span>
                  <span className="text-black font-medium">{baseNotesList.join(' · ')}</span>
                </div>
              </div>
            </div>

            {/* Size Capsule Selection */}
            <div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-black/50 block mb-3">
                SELECT VOLUME
              </span>
              <div className="flex items-center gap-3">
                {[selectedSize, 'Sample Vial (3ml)'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
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

            {/* Dual Action CTA Buttons: Add to Cart & Buy Now */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              
              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full sm:flex-1 h-16 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 text-black border border-black/10 text-sm font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] uppercase tracking-wider transition-all duration-300 flex items-center justify-center cursor-pointer"
              >
                {isAdded ? '✓ Added to Cart' : 'Add to Cart'}
              </button>

              {/* Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full sm:flex-1 h-16 rounded-full bg-black hover:bg-neutral-800 active:scale-95 text-white text-sm font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] uppercase tracking-wider transition-all duration-300 flex items-center justify-center shadow-lg cursor-pointer"
              >
                Buy Now
              </button>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}