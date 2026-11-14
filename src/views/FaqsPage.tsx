'use client'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  AlertCircle, 
  ShieldCheck, 
  Truck, 
  Plus, 
  Minus, 
  ArrowUpRight,
  Sparkles,
  FlaskConical
} from 'lucide-react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'

interface FaqItem {
  id: string
  num: string
  category: 'orders' | 'shipping' | 'formulas' | 'care'
  question: string
  summary: string
  highlights: string[]
}

const FAQ_DATA: FaqItem[] = [
  // 01. Orders & Policy
  {
    id: 'returns-cancellations',
    num: '01',
    category: 'orders',
    question: 'Orders, Cancellations & Returns',
    summary: 'Each CHEM BROS fragrance is carefully prepared and packaged before dispatch. As fragrances are personal-use products, we generally do not accept returns or exchanges for reasons of preference. However, if your order arrives damaged, defective or incorrect, please contact us with supporting photographs so our team can assist you in accordance with our applicable policies.',
    highlights: [
      'Carefully Prepared: Each fragrance is prepared and packaged before dispatch from our Madurai facility.',
      'Personal-Use Products: As fragrances are personal-use products, we generally do not accept returns or exchanges for reasons of preference.',
      'Damaged or Incorrect Orders: If your order arrives damaged, defective or incorrect, please contact us with supporting photographs so our team can assist you.'
    ]
  },
  {
    id: 'prepaid-payments',
    num: '02',
    category: 'orders',
    question: 'Payment Gateways & Online Payment Policy',
    summary: 'Chembros operates on a 100% online prepaid model. All orders are processed securely via verified payment gateways.',
    highlights: [
      'Prepaid Orders: Orders are settled at checkout via UPI, Net Banking, or Credit/Debit Cards.',
      'Express Dispatch: Seamless digital payments guarantee expedited warehouse packaging and temperature-monitored transit for perfume extracts.',
      'Payment Encryption: All checkout sessions are processed through bank-grade, PCI-DSS Level 1 compliant gateways.'
    ]
  },

  // 02. Shipping & Delivery
  {
    id: 'shipping-timeline',
    num: '03',
    category: 'shipping',
    question: 'Dispatch Timelines & Domestic Transit',
    summary: 'Every flacon is packed under climate-monitored conditions and shipped via express domestic freight from Madurai.',
    highlights: [
      'Dispatch Window: Orders ship within 24 to 48 business hours.',
      'Delivery Schedule: Tier-1 Metros (Bengaluru, Chennai, Mumbai, Delhi, Hyderabad) arrive within 2–4 business days. Regional destinations require 4–6 days.',
      'Live Telemetry: Real-time airway bill tracking links are transmitted via SMS and email immediately upon dispatch.'
    ]
  },
  {
    id: 'freight-charges',
    num: '04',
    category: 'shipping',
    question: 'Shipping Tariffs & Free Delivery Threshold',
    summary: 'We offer complimentary shipping across India on qualifying orders. Every order is carefully packed and dispatched from our base in Madurai',
    highlights: [
      'Complimentary Shipping: Orders of ₹1,500 and above qualify for free standard shipping.',
      'Standard Shipping: A flat shipping fee of ₹100 applies to orders below ₹1,500.',
      'Delivery Timeline: Standard orders are typically delivered within 3 to 5 business days across India. ,'
    ]
  },

  // 03. Formulas & Science
  {
    id: 'concentration',
    num: '05',
    category: 'formulas',
    question: 'Extrait Concentration & Scent Longevity',
    summary: 'Chembros flacons are compounded at genuine Extrait de Parfum strength (25% to 32% pure aromatic extract).',
    highlights: [
      '10+ Hours Wear Time: Heavy molecular weight bases (Iso E Super, Ambroxan, Australian Sandalwood) bind to skin lipids for all-day performance.',
      'Zero Synthetic Fillers: Formulated without harsh synthetic chemical fixatives that cause olfactory fatigue or powdery dry-downs.',
      'Body Heat Adaptive: Molecules evolve organically throughout the day based on individual body temperature and skin pH.'
    ]
  },
  {
    id: 'discovery-set',
    num: '06',
    category: 'formulas',
    question: 'Sampling & The Discovery Archive',
    summary: 'Because all sales are final, we strongly encourage exploring our miniature vials before purchasing full flacons.',
    highlights: [
      '4 × 3ml Extrait Vials: The Discovery Archive features miniature atomizers of Molecule J, Molecule X, Molecule T, and Molecule R.',
      'Side-by-Side Testing: Wear each formula across multiple days in real-world settings before choosing your signature scent.',
      'Complete Presentation: Includes dedicated molecular notes guide and luxury presentation box.'
    ]
  },

  // 04. Flacon Care
  {
    id: 'storage-care',
    num: '07',
    category: 'care',
    question: 'Optimal Flacon Storage & Maintenance',
    summary: 'Preserve the delicate top notes and organic resins of your fragrance through proper handling.',
    highlights: [
      'Avoid Heat & Light: Keep flacons stored away from direct sunlight, humid bathrooms, and warm vehicle interiors.',
      'Cap Sealed: Ensure the handcrafted wood cap is securely clicked into place to prevent ambient oxidation.',
      'Multi-Year Shelf Life: Kept in a cool, dark cabinet, high-concentration extraits mature and maintain potency for years.'
    ]
  }
]

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>('returns-cancellations')

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const filteredFaqs =
    activeCategory === 'all'
      ? FAQ_DATA
      : FAQ_DATA.filter((item) => item.category === activeCategory)

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center select-none font-['Montserrat',sans-serif]">
      {/* Top Floating Navigation */}
      <NavBar />

      <main className="w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 pt-28 sm:pt-36 pb-24 flex-1 flex flex-col items-center">
        
        {/* =========================================================================
            HEADER SECTION: MATCHING EDITORIAL HERO
            ========================================================================= */}
        <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-4 mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-[10px] font-mono tracking-[0.25em] uppercase text-black/70">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            <span>CLIENT CONCIERGE & PROTOCOLS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight uppercase text-black leading-[1.05]">
            Frequently Asked
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed max-w-xl mx-auto">
            Everything you need to know about our fragrances, ingredients, orders and delivery.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[10px] sm:text-[11px] font-mono tracking-wider text-black/50 uppercase">
            <span>CRAFTED IN MADURAI</span>
            <span>•</span>
            <span>25% CONCENTRATION</span>
            <span>•</span>
            <span>FOUR DISTINCT COMPOSITIONS</span>
          </div>
        </div>

        {/* =========================================================================
            3-CARD PILLAR HIGHLIGHTS (CONSISTENT WITH PRIVACY POLICY)
            ========================================================================= */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-14 sm:mb-20">
          <div className="p-6 sm:p-7 rounded-[26px] bg-[#FAF9F6] border border-black/[0.08] flex flex-col justify-between shadow-xs hover:border-black/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center mb-5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-mono tracking-widest uppercase text-black/40 block">COMMERCIAL POLICY</span>
              <h2 className="text-sm sm:text-base font-semibold uppercase tracking-tight text-black">
              ORDERS, CANCELLATIONS & RETURNS
              </h2>
              <p className="text-xs text-neutral-600 font-normal leading-relaxed pt-1">
                Each CHEM BROS fragrance is carefully prepared and packaged before dispatch. As fragrances are personal-use products, we generally do not accept returns or exchanges for reasons of preference. However, if your order arrives damaged, defective or incorrect, please contact us with supporting photographs so our team can assist you in accordance with our applicable policies.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-7 rounded-[26px] bg-[#FAF9F6] border border-black/[0.08] flex flex-col justify-between shadow-xs hover:border-black/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center mb-5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-mono tracking-widest uppercase text-black/40 block">PAYMENT SYSTEM</span>
              <h2 className="text-sm sm:text-base font-semibold uppercase tracking-tight text-black">
                100% Prepaid Only
              </h2>
              <p className="text-xs text-neutral-600 font-normal leading-relaxed pt-1">
                All consignments are processed via encrypted UPI and card gateways to ensure immediate express transit.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-7 rounded-[26px] bg-[#FAF9F6] border border-black/[0.08] flex flex-col justify-between shadow-xs hover:border-black/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center mb-5">
              <Truck className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-mono tracking-widest uppercase text-black/40 block">LOGISTICS FREIGHT</span>
              <h2 className="text-sm sm:text-base font-semibold uppercase tracking-tight text-black">
                Complimentary Transit
              </h2>
              <p className="text-xs text-neutral-600 font-normal leading-relaxed pt-1">
                Free temperature-monitored domestic air delivery across India on all acquisitions of ₹1,500 and above.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CATEGORY SELECTOR PILLS
            ========================================================================= */}
        <div className="w-full max-w-5xl flex items-center gap-2 overflow-x-auto pb-4 mb-8 sm:mb-12 no-scrollbar">
          {[
            { key: 'all', label: 'All Protocols' },
            { key: 'orders', label: 'Orders & Payments' },
            { key: 'shipping', label: 'Shipping & Freight' },
            { key: 'formulas', label: 'Formulas & Science' },
            { key: 'care', label: 'Flacon Care' },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase whitespace-nowrap transition-all duration-300 cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-black text-white shadow-sm font-semibold'
                  : 'bg-[#FAF9F6] text-black/70 border border-black/5 hover:border-black/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* =========================================================================
            STRUCTURED FAQ CARDS (TWO-COLUMN ARCHITECTURE)
            ========================================================================= */}
        <div className="w-full max-w-5xl flex flex-col gap-6 text-left">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id

            return (
              <div
                key={faq.id}
                id={faq.id}
                className="w-full rounded-[28px] sm:rounded-[36px] bg-[#FAF9F6] border border-black/[0.08] p-6 sm:p-10 lg:p-12 transition-all duration-300 hover:border-black/20 hover:shadow-xs relative"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 sm:gap-8">
                  
                  {/* Left Column: Directive & Question Header */}
                  <div className="lg:w-[38%] space-y-2.5 shrink-0">
                    <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-black/40 uppercase">
                      <span>DIRECTIVE // {faq.num}</span>
                    </div>

                    <h2 className="text-lg sm:text-2xl font-semibold uppercase tracking-tight text-black leading-snug">
                      {faq.question}
                    </h2>

                    <p className="text-xs sm:text-[13px] text-neutral-600 font-normal leading-relaxed pt-1">
                      {faq.summary}
                    </p>

                    <button
                      type="button"
                      onClick={() => toggleAccordion(faq.id)}
                      className="inline-flex lg:hidden items-center gap-1.5 pt-2 text-xs font-mono uppercase tracking-wider text-black font-semibold cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Specifications' : 'View Specifications'}</span>
                      {isExpanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Right Column: Specification Points Box */}
                  <div className={`lg:w-[58%] rounded-2xl bg-white border border-black/5 p-5 sm:p-7 space-y-3.5 shadow-xs ${isExpanded ? 'block' : 'hidden lg:block'}`}>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-black/40 block mb-1">
                      OPERATIONAL PARAMETERS
                    </span>

                    {faq.highlights.map((point, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-3 text-xs sm:text-[13px] text-neutral-800 leading-relaxed font-normal">
                        <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-2" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )
          })}
        </div>

        {/* =========================================================================
            BOTTOM DISCOVERY ARCHIVE CALLOUT BANNER
            ========================================================================= */}
        <div className="w-full max-w-5xl mt-12 p-8 sm:p-10 rounded-[32px] bg-black text-white flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-xl">
          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-semibold uppercase tracking-tight">
              DISCOVER BEFORE YOU DECIDE
            </h3>
            <p className="text-xs text-white/70 max-w-md font-normal leading-relaxed">
              Four compositions. One discovery. Experience all four fragrances from the CHEM BROS Molecule Series on your skin before choosing your full-size fragrance.
            </p>
          </div>

          <Link
            to="/fragrances/the-discovery-archive"
            className="px-7 py-3.5 rounded-full bg-white hover:bg-neutral-100 active:scale-95 text-black text-xs font-mono uppercase tracking-widest font-semibold transition-all shrink-0 shadow-sm flex items-center gap-2"
          >
            <span>get it now</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  )
}