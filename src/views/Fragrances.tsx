'use client'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProductsApi, getCachedProductsSync } from '../services/api'
import type { Product } from '../types'
import NavBar from '../components/NavBar'
import VideoArea, { FRAGRANCES_VIDEO_SRC } from '../components/VideoArea'
import Footer from '../components/Footer'
import bottleImg from '../assets/bottle.png'
import { usePlatformSettings } from '../context/PlatformSettingsContext'

export default function Fragrances() {
  const { settings } = usePlatformSettings()
  const [filter, setFilter] = useState<'all' | 'bottles' | 'sets'>('all')
  const initialProducts = getCachedProductsSync() || []
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(initialProducts.length === 0)

  useEffect(() => {
    let isMounted = true
    async function fetchProducts() {
      try {
        const data = await getProductsApi()
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProducts(data)
        }
      } catch (err) {
        console.error('Failed to fetch live fragrances from DB:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    const handleProductsUpdated = (e: any) => {
      if (!isMounted) return
      const updated = e.detail
      if (Array.isArray(updated) && updated.length > 0) {
        setProducts(updated)
      }
    }

    window.addEventListener('chembros:products-updated', handleProductsUpdated)
    fetchProducts()

    return () => {
      isMounted = false
      window.removeEventListener('chembros:products-updated', handleProductsUpdated)
    }
  }, [])

  const displayedProducts = products
    .filter((item) => {
      if (filter === 'bottles') return !item.is_archive
      if (filter === 'sets') return Boolean(item.is_archive)
      return true
    })
    .sort((a, b) => {
      const orderA = a.sort_order != null && a.sort_order > 0 ? a.sort_order : 999999
      const orderB = b.sort_order != null && b.sort_order > 0 ? b.sort_order : 999999
      if (orderA !== orderB) return orderA - orderB
      return Number(a.id) - Number(b.id)
    })

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col justify-between overflow-x-hidden">
      <NavBar />

      <main className="w-full flex flex-col items-center pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        
        {/* =========================================================================
            HEADER & FILTER SECTION
            ========================================================================= */}
        <div className="w-full max-w-[1583px] flex flex-col md:flex-row md:items-end justify-between border-b border-black/10 pb-6 sm:pb-8 mb-8 sm:mb-12 gap-6">
          <div>
            <span className="text-[10px] sm:text-xs font-mono tracking-[0.25em] text-black/50 uppercase block mb-1.5">
              THE MOLECULAR ARCHIVE
            </span>
            <h1 className="text-[clamp(26px,4vw,56px)] font-semibold font-['Montserrat',sans-serif] uppercase tracking-tight text-black leading-tight">
              All Formulations
            </h1>
          </div>

          {/* Responsive Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full md:w-auto font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-[11px] sm:text-xs uppercase tracking-wider">
            {(['all', 'bottles', 'sets'] as const).map((tab) => {
              const count =
                tab === 'all'
                  ? products.length
                  : tab === 'bottles'
                  ? products.filter((p) => !p.is_archive).length
                  : products.filter((p) => p.is_archive).length

              const label =
                tab === 'all'
                  ? 'All'
                  : tab === 'bottles'
                  ? 'Single Bottles'
                  : 'Archive Sets'

              return (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 flex items-center gap-1.5 ${
                    filter === tab
                      ? 'bg-black text-white shadow-md font-medium'
                      : 'bg-black/5 hover:bg-black/10 text-black/70'
                  }`}
                >
                  <span>{label}</span>
                  <span className="font-mono text-[10px] sm:text-[11px] opacity-75">
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* =========================================================================
            PRODUCT GRID (Uniform Pure White Surface Across All Cards)
            ========================================================================= */}
        {loading ? (
          <div className="w-full max-w-[1583px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-4 xl:gap-6 2xl:gap-8 justify-items-center">
            {[1, 2, 3, 4].map((n) => (
              <div 
                key={n} 
                className="w-full max-w-[340px] sm:max-w-none h-[440px] sm:h-[460px] lg:h-[470px] xl:h-[540px] rounded-[24px] sm:rounded-[34px] bg-neutral-100 border border-black/5 animate-pulse" 
              />
            ))}
          </div>
        ) : (
          <div className="w-full max-w-[1583px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-4 xl:gap-6 2xl:gap-8 justify-items-center">
            {displayedProducts.map((prod) => {
              const isArchive = Boolean(prod.is_archive)

              return (
                <Link
                  key={prod.id}
                  to={`/fragrances/${prod.slug || prod.id}`}
                  className="w-full max-w-[340px] sm:max-w-none h-[440px] sm:h-[460px] lg:h-[470px] xl:h-[540px] 2xl:h-[587px] relative rounded-[24px] sm:rounded-[34px] lg:rounded-[36px] xl:rounded-[44px] 2xl:rounded-[50px] overflow-hidden flex flex-col justify-between p-5 sm:p-6 lg:p-5 xl:p-7 2xl:p-8 transition-all duration-300 hover:-translate-y-1.5 group border bg-white border-black/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_42px_rgba(0,0,0,0.08)] hover:border-black/20"
                >
                  {/* Card Header */}
                  <div className="w-full space-y-1.5">
                    <div className="flex items-center justify-between text-black/50">
                      <span className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase">
                        SPECIMEN {prod.code || `0${prod.id}`}
                      </span>

                      <span className="text-[9px] sm:text-[10px] font-mono text-black/70 bg-black/5 px-2 py-0.5 rounded-full border border-black/10">
                        {prod.volume_ml ? `${prod.volume_ml}ml` : isArchive ? '4 × 3ml' : '30ml'}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm lg:text-[13px] xl:text-base 2xl:text-lg font-semibold font-['Montserrat',sans-serif] tracking-tight uppercase text-black leading-snug truncate">
                      {prod.name}
                    </h3>
                  </div>

                  {/* Bottle / Archive Box Showcase Plinth */}
                  <div className="my-auto flex items-center justify-center relative w-full h-[180px] sm:h-[200px] lg:h-[210px] xl:h-[250px] 2xl:h-[280px]">
                    <img
                      src={prod.image_base64 || (bottleImg as any)?.src || bottleImg}
                      alt={prod.name}
                      draggable={false}
                      className="w-auto h-full max-h-[170px] sm:max-h-[190px] lg:max-h-[195px] xl:max-h-[235px] 2xl:max-h-[265px] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.1)] group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-500 select-none pointer-events-none"
                    />
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-black/[0.08] pt-3.5 sm:pt-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 pr-2">
                      <div className="text-[10px] sm:text-[11px] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-neutral-500 truncate max-w-[180px] sm:max-w-[220px]">
                        {prod.subtitle || 'Extrait de Parfum'}
                      </div>
                      <div className="text-base sm:text-lg lg:text-base xl:text-xl 2xl:text-2xl font-semibold font-['Montserrat',sans-serif] tracking-tight text-black mt-0.5">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Circular Action Arrow */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-neutral-800 transition-all duration-300 shadow-md">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

      </main>

      {(settings?.enable_video_stories ?? true) && <VideoArea videoSrc={FRAGRANCES_VIDEO_SRC} />}

      <Footer />
    </div>
  )
}