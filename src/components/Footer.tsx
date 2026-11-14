'use client'
import { Link } from 'react-router-dom'
import footerBgImg from '../assets/bg/ftb1.png'

interface FooterProps {
  onOpenStory?: () => void
  onOpenContact?: () => void
  onOpenPolicy?: (type: 'shipping' | 'privacy' | 'terms') => void
}

export const Footer = ({
  onOpenStory,
  onOpenContact,
  onOpenPolicy,
}: FooterProps) => {
  return (
    <footer className="w-full flex flex-col justify-center items-center overflow-hidden select-none bg-white py-6 sm:py-8 lg:py-12 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      
      {/* Outer Card Container */}
      <div className="w-full max-w-[1583px] relative rounded-[20px] sm:rounded-[32px] lg:rounded-[44px] xl:rounded-[50px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-black/5 flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-14 xl:p-16 min-h-[460px] sm:min-h-[500px] lg:min-h-[560px] xl:h-[640px]">
        
        {/* Layer 1: Background Atmospheric Graphic */}
        <img
          className="w-full h-full inset-0 absolute object-cover object-bottom select-none pointer-events-none"
          src={(footerBgImg as any)?.src || footerBgImg}
          alt="Chembros Footer Bottles"
          draggable={false}
        />

        {/* Layer 2: Top Balanced Editorial Header & Navigation */}
        <div className="relative z-10 w-full flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-12">
          
          {/* Top Left: Bold Brand Wordmark */}
          <div className="flex flex-col items-start max-w-sm">
            <h2 className="text-black text-3xl sm:text-4xl lg:text-5xl font-semibold font-['Montserrat',sans-serif] tracking-wider uppercase leading-none">
              CHEMBROS
            </h2>
            <p className="mt-3 text-xs sm:text-[13px] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-neutral-600 leading-relaxed max-w-xs">
              Science led perfumery. Rooted in Madurai.
            </p>
          </div>

          {/* Top Right: 3-Column Navigation Grid */}
          <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-14 xl:gap-16">
            
            {/* Column 1: THE BRAND */}
            <div className="flex flex-col items-start gap-2.5 sm:gap-3">
              <span className="text-black text-[11px] sm:text-xs font-semibold font-['Montserrat',sans-serif] tracking-widest uppercase">
                THE BRAND
              </span>
              <div className="flex flex-col items-start gap-1.5 sm:gap-2">
                <Link
                  to="/our-story"
                  onClick={onOpenStory}
                  className="text-neutral-700 hover:text-black text-xs sm:text-[13px] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] transition-colors cursor-pointer text-left"
                >
                  Our Story
                </Link>
                <a
                  href="mailto:connect@thechemicalbrothers.in"
                  className="text-neutral-700 hover:text-black text-xs sm:text-[13px] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] transition-colors cursor-pointer text-left"
                >
                  Contact
                </a>
                <Link
                  to="/fragrances"
                  className="text-neutral-700 hover:text-black text-xs sm:text-[13px] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] transition-colors"
                >
                  Fragrances
                </Link>
                <Link
                  to="/faqs"
                  className="text-neutral-700 hover:text-black text-xs sm:text-[13px] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] transition-colors"
                >
                  FAQs
                </Link>
              </div>
            </div>

            {/* Column 2: DISCOVER */}
            <div className="flex flex-col items-start gap-2.5 sm:gap-3">
              <span className="text-black text-[11px] sm:text-xs font-semibold font-['Montserrat',sans-serif] tracking-widest uppercase">
                DISCOVER
              </span>
              <div className="flex flex-col items-start gap-1.5 sm:gap-2">
                <Link
                  to="/fragrances/molecule-t"
                  className="text-neutral-700 hover:text-black text-xs sm:text-[13px] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] transition-colors"
                >
                  Molecule T
                </Link>
                <Link
                  to="/fragrances/molecule-j"
                  className="text-neutral-700 hover:text-black text-xs sm:text-[13px] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] transition-colors"
                >
                  Molecule J
                </Link>
                <Link
                  to="/fragrances/molecule-x"
                  className="text-neutral-700 hover:text-black text-xs sm:text-[13px] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] transition-colors"
                >
                  Molecule X
                </Link>
                <Link
                  to="/fragrances/molecule-r"
                  className="text-neutral-700 hover:text-black text-xs sm:text-[13px] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] transition-colors"
                >
                  Molecule R
                </Link>
              </div>
            </div>

            {/* Column 3: CONNECT */}
            <div className="flex flex-col items-start gap-2.5 sm:gap-3 col-span-2 sm:col-span-1">
              <span className="text-black text-[11px] sm:text-xs font-semibold font-['Montserrat',sans-serif] tracking-widest uppercase">
                CONNECT
              </span>
              <div className="flex flex-col items-start gap-1.5 sm:gap-2">
                <a
                  href="https://www.instagram.com/chembrosmadurai?srtk=cHVmdGFpYmpoYzJs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-700 hover:text-black text-xs sm:text-[13px] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] transition-colors"
                >
                  Instagram
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenPolicy) onOpenPolicy('shipping')
                    else window.location.href = '/faqs'
                  }}
                  className="text-neutral-700 hover:text-black text-xs sm:text-[13px] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] transition-colors cursor-pointer text-left whitespace-nowrap"
                >
                  Shipping & Returns
                </button>
                <Link
                  to="/privacy-policy"
                  onClick={(e) => {
                    if (onOpenPolicy) {
                      e.preventDefault()
                      onOpenPolicy('privacy')
                    }
                  }}
                  className="text-neutral-700 hover:text-black text-xs sm:text-[13px] font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] transition-colors cursor-pointer text-left whitespace-nowrap"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Layer 3: Minimal Bottom Metadata Outside the Card in Solid Black */}
      <div className="w-full max-w-[1583px] px-2 sm:px-4 pt-4 sm:pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <span className="text-black font-mono text-[10px] tracking-wider uppercase">
          © 2026 CHEMBROS ARCHIVE. ALL RIGHTS RESERVED.
        </span>
        <a
          href="https://www.behindbrief.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black hover:text-neutral-600 font-mono text-[10px] tracking-wider uppercase transition-colors cursor-pointer"
        >
          DESIGNED & DEVELOPED BY BEHINDBRIEF
        </a>
      </div>

    </footer>
  )
}

export default Footer