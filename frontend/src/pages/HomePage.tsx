import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Homehero from '../components/Homehero'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'
import type { Product } from '../types'
import { getTrendingProductsApi } from '../services/api'
import { ArrowRight, Sparkles, Beaker, Shield, Clock } from 'lucide-react'

export default function HomePage() {
  const [trending, setTrending] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFamily, setSelectedFamily] = useState<string>('All')

  useEffect(() => {
    async function loadTrending() {
      try {
        const data = await getTrendingProductsApi(8)
        setTrending(data)
      } catch (err) {
        console.error('Failed to load trending products:', err)
      } finally {
        setLoading(false)
      }
    }
    loadTrending()
  }, [])

  const filteredTrending = selectedFamily === 'All'
    ? trending
    : trending.filter((p) => p.fragrance_family.toLowerCase().includes(selectedFamily.toLowerCase()))

  return (
    <div className="w-full flex flex-col items-center bg-white">
      {/* Pristine Hero Section */}
      <Homehero />

      {/* Trending Formulations Section */}
      <section className="w-full max-w-[1576px] px-6 py-24 mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500 font-['Inter',sans-serif]">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              Algorithmically Ranked
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-['Cinzel',serif] text-black mt-2">
              Trending Formulations
            </h2>
            <p className="text-sm text-neutral-600 mt-2 max-w-xl font-['Inter',sans-serif]">
              Discover our most coveted molecular fragrances, calibrated for high-impact longevity and intimate skin projection.
            </p>
          </div>

          {/* Scent Family Filters */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Woody', 'Amber', 'Floral', 'Fresh'].map((fam) => (
              <button
                key={fam}
                onClick={() => setSelectedFamily(fam)}
                className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  selectedFamily === fam
                    ? 'bg-black text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {fam}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : filteredTrending.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredTrending.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-400">
            No trending formulations in this olfactory category.
          </div>
        )}

        <div className="mt-14 text-center">
          <Link
            to="/fragrances"
            className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-full text-xs font-medium uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            Explore Complete Catalog
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* The Chemistry of Chembros Feature Section */}
      <section className="w-full bg-neutral-50 py-24 border-y border-neutral-200/60">
        <div className="max-w-[1576px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-neutral-500 font-['Inter',sans-serif]">
              The Haute Parfumerie Standard
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-['Cinzel',serif] text-black mt-2">
              Chemistry As An Art Form
            </h2>
            <p className="text-sm text-neutral-600 mt-3 font-['Inter',sans-serif] leading-relaxed">
              We reject the industrial dilutions of commercial perfumery. Each flacon is formulated with up to 35% pure oil density for uncompromised sillage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-3xl border border-neutral-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black">
                <Beaker className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-['Cinzel',serif] text-lg font-bold text-black">
                Molecular Synthesis
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-['Inter',sans-serif]">
                Precision synthesis of clean musk macromolecules and transparent wood compounds (Iso E Super, Ambroxan, Cashmeran) that adapt to your body heat.
              </p>
            </div>

            <div className="p-8 bg-white rounded-3xl border border-neutral-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black">
                <Clock className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-['Cinzel',serif] text-lg font-bold text-black">
                16-Hour Tenacity
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-['Inter',sans-serif]">
                High molecular-weight base anchors lock delicate floral and citrus head notes, extending projection from sunrise to late evening without reapplication.
              </p>
            </div>

            <div className="p-8 bg-white rounded-3xl border border-neutral-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black">
                <Shield className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-['Cinzel',serif] text-lg font-bold text-black">
                Madurai Extraction
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-['Inter',sans-serif]">
                Ethically harvested night-blooming Jasmine Sambac extracted at dawn via cold solvent-free CO2 distillation, preserving the living blossom's true essence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
