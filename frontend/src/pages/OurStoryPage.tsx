import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { Beaker, Sparkles, Shield, ArrowRight } from 'lucide-react'

export default function OurStoryPage() {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center">
      {/* Top Floating Navigation */}
      <div className="w-full flex justify-center pt-8 pb-6 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <NavBar />
      </div>

      <main className="w-full max-w-[1200px] px-6 py-16 flex-1 space-y-24">
        {/* Hero Narrative */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-neutral-500 font-['Inter',sans-serif]">
            CHEM BROS PHILOSOPHY
          </p>
          <h1 className="text-4xl md:text-6xl font-bold font-['Cinzel',serif] text-black leading-tight">
            Chemistry Captured In A Bottle
          </h1>
          <p className="text-sm md:text-base text-neutral-600 leading-relaxed font-['Inter',sans-serif] pt-2">
            Chembros was born at the convergence of ancient Tamil botanical heritage and avant-garde molecular physics. We believe true luxury perfumery is not nostalgic imitation, but scientific elevation.
          </p>
        </section>

        {/* Section 1: The Madurai Terroir */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-neutral-50 rounded-3xl p-8 md:p-14 border border-neutral-200">
          <div className="space-y-4">
            <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">Terroir // Madurai</span>
            <h2 className="text-2xl md:text-3xl font-bold font-['Cinzel',serif] text-black">
              Madurai Sambac: The Heart of Molecule J
            </h2>
            <p className="text-xs md:text-sm text-neutral-600 leading-relaxed font-['Inter',sans-serif]">
              In the red soils surrounding Madurai, Jasminum sambac develops a narcotic, indolic character found nowhere else on earth. Hand-picked at 4:00 AM before the heat of the sun dissipates its volatile esters, the blossom is immediately transferred to our cold extraction facility.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-3 font-mono text-xs">
            <div className="text-[10px] text-neutral-400 uppercase tracking-widest">Spectrometric Signature</div>
            <div className="text-neutral-800">Origin: Madurai, Tamil Nadu (9.9252° N, 78.1198° E)</div>
            <div className="text-neutral-800">Extraction: Supercritical CO2 (Solvent-Free)</div>
            <div className="text-neutral-800">Key Esters: Benzyl Acetate, Linalool, Indole High-Cis</div>
            <div className="text-neutral-500 text-[11px]">Concentration in Molecule J: 30% Pure Extrait</div>
          </div>
        </section>

        {/* Section 2: Molecular Distillation */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-neutral-50 rounded-3xl border border-neutral-200 space-y-3">
            <Beaker className="w-6 h-6 text-black" />
            <h3 className="font-['Cinzel',serif] text-lg font-bold text-black">High-Molecular Polymers</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              We employ synthetic fixing macromolecules like Ambroxan, Cetalox, and Iso E Super that bond with sebum to create a personalized olfactory trail unique to the wearer.
            </p>
          </div>

          <div className="p-8 bg-neutral-50 rounded-3xl border border-neutral-200 space-y-3">
            <Sparkles className="w-6 h-6 text-black" />
            <h3 className="font-['Cinzel',serif] text-lg font-bold text-black">30% Extrait Density</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              While conventional commercial fragrances hover at 12–15% dilution, Chembros formulations are saturated up to 35% concentration for true all-day longevity.
            </p>
          </div>

          <div className="p-8 bg-neutral-50 rounded-3xl border border-neutral-200 space-y-3">
            <Shield className="w-6 h-6 text-black" />
            <h3 className="font-['Cinzel',serif] text-lg font-bold text-black">Sustainable Synthesis</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              By synthesizing rare sandalwood, animalic ambergris, and musk accords, we preserve endangered forests and natural ecosystems while exceeding IFRA purity standards.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 space-y-6">
          <h2 className="text-3xl font-bold font-['Cinzel',serif] text-black">
            Experience The Olfactory Monument
          </h2>
          <div>
            <Link
              to="/fragrances"
              className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl"
            >
              Explore Formulations
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
