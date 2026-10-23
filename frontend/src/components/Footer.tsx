import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full bg-neutral-950 text-white mt-24 border-t border-neutral-900 selection:bg-neutral-800">
      <div className="max-w-[1576px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-neutral-800">
          {/* Brand Intro */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-['Cinzel',serif] text-2xl font-bold tracking-widest text-white">
              CHEM BROS
            </h3>
            <p className="text-xs text-neutral-400 font-['Inter',sans-serif] leading-relaxed">
              Chemistry captured in a bottle. We unite artisanal natural botanicals with avant-garde molecular syntheses to create enduring olfactory monuments.
            </p>
            <div className="pt-2 text-[11px] text-neutral-500 font-mono tracking-wider">
              MADURAI // PARIS // BENGALURU
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-widest font-['Inter',sans-serif]">
              Collection
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400 font-['Poppins',sans-serif]">
              <li>
                <Link to="/fragrances" className="hover:text-white transition-colors">All Extraits</Link>
              </li>
              <li>
                <Link to="/fragrances?family=Woody" className="hover:text-white transition-colors">Woody Synthetics</Link>
              </li>
              <li>
                <Link to="/fragrances?family=Amber" className="hover:text-white transition-colors">Oriental Ambers</Link>
              </li>
              <li>
                <Link to="/fragrances?family=Floral" className="hover:text-white transition-colors">Floral Distillates</Link>
              </li>
              <li>
                <Link to="/fragrances?family=Fresh" className="hover:text-white transition-colors">High-Polymer Citrus</Link>
              </li>
            </ul>
          </div>

          {/* House Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-widest font-['Inter',sans-serif]">
              Client Care
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400 font-['Poppins',sans-serif]">
              <li>
                <Link to="/my-orders" className="hover:text-white transition-colors">Track Shipment</Link>
              </li>
              <li>
                <Link to="/our-story" className="hover:text-white transition-colors">The Chemistry & Craft</Link>
              </li>
              <li>
                <span className="text-neutral-500">Cashfree PG Secure Checkout</span>
              </li>
              <li>
                <span className="text-neutral-500">Gmail SMTP Verified Dispatch</span>
              </li>
              <li>
                <Link to="/admin" className="flex items-center gap-1.5 text-neutral-500 hover:text-white transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-widest font-['Inter',sans-serif]">
              Private Olfactory Dispatch
            </h4>
            <p className="text-xs text-neutral-400 font-['Inter',sans-serif]">
              Receive invites to limited molecular batch releases and chemistry notes.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-l-full text-xs text-white focus:outline-none focus:border-neutral-600 transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-white text-black rounded-r-full text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 font-['Inter',sans-serif] gap-4">
          <p>&copy; {new Date().getFullYear()} Chembros Parfums. All rights reserved.</p>
          <div className="flex gap-6">
            <span>IFRA Certified Formulations</span>
            <span>Cruelty-Free Chemistry</span>
            <span>Zero Toxic Solvents</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
