import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getProductsApi } from '../services/api'
import type { Product } from '../types'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import bottleImg from '../assets/bottle.png'

export default function Fragrances() {
  const [filter, setFilter] = useState<'all' | 'bottles' | 'sets'>('all')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getProductsApi()
        setProducts(data)
      } catch (err) {
        console.error('Failed to fetch live fragrances from DB:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const displayedProducts = products.filter((item) => {
    if (filter === 'bottles') return !item.is_archive
    if (filter === 'sets') return Boolean(item.is_archive)
    return true
  })

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col justify-between">
      {/* Dynamic Animated NavBar */}
      <NavBar />

      <main className="w-full flex flex-col items-center pt-32 pb-24 px-6 lg:px-16">
        
        {/* Header Section */}
        <div className="w-full max-w-[1576px] flex flex-col md:flex-row md:items-end justify-between border-b border-black/10 pb-8 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.25em] text-black/50 uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              <span>LABORATORY ARCHIVE // 2026</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-normal font-['Conquera',sans-serif] uppercase tracking-wider text-black">
              ALL FORMULATIONS
            </h1>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mt-6 md:mt-0 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-xs uppercase tracking-wider">
            {(['all', 'bottles', 'sets'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  filter === tab
                    ? 'bg-black text-white shadow-md'
                    : 'bg-black/5 hover:bg-black/10 text-black/70'
                }`}
              >
                {tab === 'all'
                  ? `All (${products.length})`
                  : tab === 'bottles'
                  ? `Single Bottles (${products.filter((p) => !p.is_archive).length})`
                  : `Discovery Archive (${products.filter((p) => p.is_archive).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="w-full max-w-[1576px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-96 rounded-[45px] bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="w-full max-w-[1576px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayedProducts.map((prod) => (
              <Link
                key={prod.id}
                to={`/fragrances/${prod.slug || prod.id}`}
                className={`group relative rounded-[45px] overflow-hidden flex flex-col justify-between p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(0,0,0,0.18)] ${
                  prod.is_archive
                    ? 'bg-gradient-to-br from-neutral-900 to-black text-white md:col-span-2 lg:col-span-2'
                    : 'bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase block mb-1">
                      SPECIMEN {prod.code || `0${prod.id}`}
                    </span>
                    <h3 className="text-2xl font-normal font-['Conquera',sans-serif] tracking-wider uppercase text-white">
                      {prod.name}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-white/60 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    {prod.volume_ml ? `${prod.volume_ml}ml Extrait` : '30ml Extrait'}
                  </span>
                </div>

                {/* Bottle Showcase Plinth */}
                <div className="my-8 flex justify-center items-center relative py-6">
                  <div className="w-56 h-56 rounded-full bg-white/5 blur-3xl absolute -z-10 group-hover:scale-125 transition-transform duration-700" />
                  <img
                    src={prod.image_base64 || bottleImg}
                    alt={prod.name}
                    draggable={false}
                    className="w-52 h-56 object-contain select-none drop-shadow-[0_20px_35px_rgba(255,255,255,0.08)] group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-500"
                  />
                </div>

                {/* Card Footer: Notes & Price */}
                <div className="border-t border-white/10 pt-5 flex items-center justify-between">
                  <div className="pr-4">
                    <div className="text-[11px] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-white/60 truncate max-w-[200px]">
                      {prod.subtitle}
                    </div>
                    <div className="text-xl font-normal font-['Conquera',sans-serif] text-white mt-0.5">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}