import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FRAGRANCES_DATA } from '../data/fragranceData'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const product = FRAGRANCES_DATA.find((item) => item.id === id) || FRAGRANCES_DATA[0]
  const [selectedSize, setSelectedSize] = useState<string>(product.volume)
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = () => {
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2500)
  }

  const handleBuyNow = () => {
    // Direct checkout routing
    navigate('/checkout')
  }

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
                SPECIMEN // {product.code}
              </span>
              <span>{product.gender}</span>
            </div>

            {/* Central Bottle Display */}
            <div className="my-14 flex items-center justify-center relative">
              <div className="w-80 h-80 rounded-full bg-black/5 blur-3xl absolute -z-10" />
              <img
                src={product.image}
                alt={product.title}
                draggable={false}
                className="w-80 sm:w-96 max-h-[500px] object-contain select-none drop-shadow-[0_25px_40px_rgba(0,0,0,0.18)] hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Monograph Spec Strip */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-black/10 text-center font-mono">
              <div>
                <span className="text-[10px] text-black/40 uppercase block">CONCENTRATION</span>
                <span className="text-xs font-semibold text-black mt-1 block">30% EXTRAIT</span>
              </div>
              <div className="border-x border-black/10">
                <span className="text-[10px] text-black/40 uppercase block">LONGEVITY</span>
                <span className="text-xs font-semibold text-black mt-1 block">{product.longevity}</span>
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
              <span className="text-black font-semibold">{product.title}</span>
            </div>

            {/* Title & Price Header */}
            <div>
              <h1 className="text-4xl sm:text-5xl font-normal font-['Conquera',sans-serif] tracking-wider uppercase text-black leading-tight">
                {product.title}
              </h1>
              <div className="mt-3 flex items-baseline gap-4 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                <span className="text-3xl text-black font-semibold">
                  {product.priceFormatted}
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
                  <span className="text-black font-medium">{product.topNotes.join(' · ')}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-20 text-black/40 uppercase font-mono text-[10px]">Heart:</span>
                  <span className="text-black font-medium">{product.heartNotes.join(' · ')}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-20 text-black/40 uppercase font-mono text-[10px]">Base:</span>
                  <span className="text-black font-medium">{product.baseNotes.join(' · ')}</span>
                </div>
              </div>
            </div>

            {/* Size Capsule Selection */}
            <div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-black/50 block mb-3">
                SELECT VOLUME
              </span>
              <div className="flex items-center gap-3">
                {[product.volume, 'Sample Vial (3ml)'].map((size) => (
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