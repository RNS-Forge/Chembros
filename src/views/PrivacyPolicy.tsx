'use client'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Truck, 
  Layers, 
  Database, 
  CheckCircle2, 
  ChevronRight,
  ArrowUpRight 
} from 'lucide-react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'

interface PolicyClause {
  id: string
  num: string
  title: string
  summary: string
  points: string[]
}

const POLICY_SECTIONS: PolicyClause[] = [
  {
    id: 'sovereignty',
    num: '01',
    title: 'Data Sovereignty & Direct Integrity',
    summary: 'Chembros controls the entire synthesis and sales chain. We never monetize, rent, trade, or distribute your identity or transaction records to third-party ad brokers.',
    points: [
      'Your profile data is strictly utilized for compounding, packaging, and dispatching your extrait orders from Madurai.',
      'We do not engage in behavioural retargeting or cross-site commercial profiling.',
      'Telemetry collected is limited to essential diagnostic performance and checkout security.'
    ]
  },
  {
    id: 'prepaid',
    num: '02',
    title: 'Prepaid Protocol & Payment Security',
    summary: 'Chembros operates on a 100% online prepaid basis to ensure express transit speed, quality verification, and seamless order fulfillment.',
    points: [
      'All transactions are routed through RBI-licensed, PCI-DSS Level 1 compliant payment gateways (Razorpay / Stripe).',
      'Chembros servers never view, capture, or store your credit/debit card numbers, CVVs, or UPI MPINs.',
      'All gateway sessions are protected via end-to-end 256-bit TLS encryption.'
    ]
  },
  {
    id: 'logistics',
    num: '03',
    title: 'Logistics & Airway Transmission',
    summary: 'Your shipping coordinates are disclosed strictly to our verified domestic courier partners (Blue Dart, Delhivery) solely for consignment delivery.',
    points: [
      'Shared data is limited to: Recipient Name, Delivery Address, and Contact Mobile Number.',
      'Mobile numbers are utilized only for live airway bill dispatch updates and delivery OTP verification.',
      'Couriers are contractually prohibited from using your data for any marketing or secondary communications.'
    ]
  },
  {
    id: 'information',
    num: '04',
    title: 'Information Stored & Retained',
    summary: 'We store only the minimum essential attributes required to service your flacons and meet Indian statutory tax compliances.',
    points: [
      'Contact Coordinates: Verified name, delivery address, phone number, and email invoice destination.',
      'Order Logs: Purchased extrait formulas, bottle sizes, custom inscriptions, and GST tax invoices.',
      'Statutory Retention: Financial records are retained according to mandatory Indian corporate and GST compliance guidelines, after which they are permanently purged.'
    ]
  },
  {
    id: 'cookies',
    num: '05',
    title: 'Local Storage & Browser Cookies',
    summary: 'Our platform relies on minimal, functional local storage to maintain shopping cart items, theme preferences, and session state.',
    points: [
      'Zero third-party advertising cookies or synthetic pixel trackers are embedded into the client code.',
      'Local cookies are utilized exclusively to preserve your bag contents and sign-in credentials across navigation turns.',
      'You may clear your browser cache at any time without impacting account ownership.'
    ]
  },
  {
    id: 'concierge',
    num: '06',
    title: 'Grievance Officer & Concierge Desk',
    summary: 'Under the Information Technology Act (2000) and Digital Personal Data Protection guidelines, our legal and compliance desk is directly accessible.',
    points: [
      'Legal Entity: Chembros Archive / Chemical Brothers',
      'Compounding Facility: Madurai, Tamil Nadu, India',
      'Direct Concierge: support@chembros.com'
    ]
  }
]

export default function PrivacyPolicy() {
  const [activeTab, setActiveTab] = useState('sovereignty')

  const scrollTo = (id: string) => {
    setActiveTab(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center select-none font-['Montserrat',sans-serif]">
      {/* Top Floating Navigation */}
      <NavBar />

      <main className="w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 pt-28 sm:pt-36 pb-24 flex-1 flex flex-col items-center">
        
        {/* =========================================================================
            HEADER SECTION: EDITORIAL HEADLINE & BADGE
            ========================================================================= */}
        <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-4 mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-[10px] font-mono tracking-[0.25em] uppercase text-black/70">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            <span>LEGAL GOVERNANCE // 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight uppercase text-black leading-[1.05]">
            Privacy Policy
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed max-w-xl mx-auto">
            Discretion, encryption, and client sovereignty governing your acquisition of Chembros pure extrait molecular series.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[10px] sm:text-[11px] font-mono tracking-wider text-black/50 uppercase">
            <span>MADURAI · PARIS</span>
            <span>•</span>
            <span>RBI-COMPLIANT GATEWAY</span>
            <span>•</span>
            <span>PREPAID ONLY</span>
          </div>
        </div>

        {/* =========================================================================
            3-CARD TRUST SPEC DISCLOSURE
            ========================================================================= */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-14 sm:mb-20">
          <div className="p-6 sm:p-7 rounded-[26px] bg-[#FAF9F6] border border-black/[0.08] flex flex-col justify-between shadow-xs hover:border-black/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center mb-5">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-black/40 block">FINANCIAL SECURITY</span>
              <h2 className="text-sm sm:text-base font-semibold uppercase tracking-tight text-black">
                100% Tokenized Gateway
              </h2>
              <p className="text-xs text-neutral-600 font-normal leading-relaxed pt-1">
                Zero credit card retention. Every transaction executes through encrypted, bank-grade payment channels.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-7 rounded-[26px] bg-[#FAF9F6] border border-black/[0.08] flex flex-col justify-between shadow-xs hover:border-black/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center mb-5">
              <EyeOff className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-black/40 block">CLIENT SOVEREIGNTY</span>
              <h2 className="text-sm sm:text-base font-semibold uppercase tracking-tight text-black">
                No Ad Tracking Or Sales
              </h2>
              <p className="text-xs text-neutral-600 font-normal leading-relaxed pt-1">
                We never monetize your identity, flacon preferences, or contact records to commercial advertisers.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-7 rounded-[26px] bg-[#FAF9F6] border border-black/[0.08] flex flex-col justify-between shadow-xs hover:border-black/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center mb-5">
              <Truck className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-black/40 block">LOGISTICS ISOLATION</span>
              <h2 className="text-sm sm:text-base font-semibold uppercase tracking-tight text-black">
                Secure Transit Airway
              </h2>
              <p className="text-xs text-neutral-600 font-normal leading-relaxed pt-1">
                Recipient coordinates are disclosed strictly to licensed express freight couriers for airway bill completion.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION SELECTOR TABS (SCROLLABLE ON MOBILE)
            ========================================================================= */}
        <div className="w-full max-w-5xl flex items-center gap-2 overflow-x-auto pb-4 mb-8 sm:mb-12 no-scrollbar">
          {POLICY_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => scrollTo(sec.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase whitespace-nowrap transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                activeTab === sec.id
                  ? 'bg-black text-white shadow-sm font-semibold'
                  : 'bg-[#FAF9F6] text-black/70 border border-black/5 hover:border-black/20'
              }`}
            >
              <span className="opacity-40">{sec.num}</span>
              <span>{sec.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* =========================================================================
            STRUCTURED CLAUSE CARDS
            ========================================================================= */}
        <div className="w-full max-w-5xl flex flex-col gap-6 text-left">
          {POLICY_SECTIONS.map((clause) => (
            <div
              key={clause.id}
              id={clause.id}
              className="w-full rounded-[28px] sm:rounded-[36px] bg-[#FAF9F6] border border-black/[0.08] p-6 sm:p-10 lg:p-12 transition-all duration-300 hover:border-black/20 hover:shadow-xs relative"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 sm:gap-8">
                
                {/* Left Header */}
                <div className="lg:w-[38%] space-y-2 shrink-0">
                  <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-black/40 uppercase">
                    <span>CLAUSE // {clause.num}</span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-semibold uppercase tracking-tight text-black leading-snug">
                    {clause.title}
                  </h2>
                  <p className="text-xs sm:text-[13px] text-neutral-600 font-normal leading-relaxed pt-2">
                    {clause.summary}
                  </p>
                </div>

                {/* Right Points Box */}
                <div className="lg:w-[58%] rounded-2xl bg-white border border-black/5 p-5 sm:p-7 space-y-3.5 shadow-xs">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-black/40 block mb-1">
                    OPERATIONAL PARAMETERS
                  </span>
                  {clause.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-3 text-xs sm:text-[13px] text-neutral-800 leading-relaxed font-normal">
                      <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-2" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* =========================================================================
            BOTTOM CONCIERGE CALLOUT
            ========================================================================= */}
        <div className="w-full max-w-5xl mt-12 p-8 sm:p-10 rounded-[32px] bg-black text-white flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-xl">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase block">
              CLIENT INQUIRIES & RECTIFICATION
            </span>
            <h3 className="text-xl sm:text-2xl font-semibold uppercase tracking-tight">
              Have Questions Regarding Your Data?
            </h3>
            <p className="text-xs text-white/70 max-w-md font-normal leading-relaxed">
              Our concierge team and data compliance desk respond to all client access requests within 24 working hours.
            </p>
          </div>

          <a
            href="mailto:support@chembros.com"
            className="px-7 py-3.5 rounded-full bg-white hover:bg-neutral-100 active:scale-95 text-black text-xs font-mono uppercase tracking-widest font-semibold transition-all shrink-0 shadow-sm flex items-center gap-2"
          >
            <span>Contact Desk</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

      </main>

      <Footer />
    </div>
  )
}