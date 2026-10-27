import { useState, useEffect } from 'react'
import NavBar from '../components/NavBar'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'
import type { Product } from '../types'
import { getProductsApi } from '../services/api'
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react'

export default function FragrancesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [family, setFamily] = useState('all')
  const [sortBy, setSortBy] = useState('featured')

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true)
      try {
        const data = await getProductsApi({
          search: search.trim() || undefined,
          family: family !== 'all' ? family : undefined,
          sort_by: sortBy,
        })
        setProducts(data)
      } catch (err) {
        console.error('Failed to load fragrances:', err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(loadCatalog, 200)
    return () => clearTimeout(timer)
  }, [search, family, sortBy])

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center">
      {/* Top Floating Navigation */}
      <div className="w-full flex justify-center pt-8 pb-6 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <NavBar />
      </div>

      {/* Main Catalog Header */}
      <main className="w-full max-w-[1576px] px-6 py-12 flex-1">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-neutral-500 font-['Inter',sans-serif]">
            CHEM BROS ARCHIVE
          </p>
          <h1 className="text-4xl md:text-5xl font-bold font-['Cinzel',serif] text-black mt-2">
            The Fragrance Collection
          </h1>
          <p className="text-sm text-neutral-600 mt-3 font-['Inter',sans-serif]">
            Explore our complete laboratory collection of concentrated extraits and eaux de parfum.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-3xl p-6 mb-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by note (Jasmine, Amber, Oud)..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-neutral-300 rounded-full text-xs text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          {/* Scent Family Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'All Families' },
              { id: 'Woody', label: 'Woody' },
              { id: 'Amber', label: 'Amber / Oriental' },
              { id: 'Floral', label: 'Floral' },
              { id: 'Fresh', label: 'Fresh / Citrus' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFamily(f.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  family === f.id
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-neutral-300 rounded-full text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            >
              <option value="featured">Featured Formulations</option>
              <option value="trending">Trending & High Sillage</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center text-xs text-neutral-500 mb-6 font-['Inter',sans-serif]">
          <span>Displaying {products.length} bespoke flacons</span>
          <span>Complimentary White-Glove Shipping Across India</span>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="w-full flex flex-col items-center justify-center py-24 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-black mb-3" />
            <p className="text-xs tracking-widest uppercase">Decanting Formulations...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="w-full text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200">
            <h3 className="font-['Cinzel',serif] text-xl font-bold text-black">
              {search || family !== 'all' ? 'No fragrances match your criteria' : 'Catalog Being Formulated'}
            </h3>
            <p className="text-xs text-neutral-500 mt-2">
              {search || family !== 'all'
                ? 'Try clearing your note search or selecting "All Families".'
                : 'New bespoke formulations are being decanted in the laboratory. Administrators can add products directly via the Admin Portal.'}
            </p>
            {(search || family !== 'all') && (
              <button
                onClick={() => {
                  setSearch('')
                  setFamily('all')
                }}
                className="mt-6 px-6 py-2.5 bg-black text-white rounded-full text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
