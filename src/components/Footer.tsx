'use client'
import { Link } from 'react-router-dom';
import footerBgImg from '../assets/footerbg.png';
import modelHandImg from '../assets/footerguy.png';

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
    <footer className="w-full flex justify-center items-center overflow-hidden select-none bg-white py-6 sm:py-8 lg:py-12 px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      
      {/* Outer Card Container */}
      <div className="w-full max-w-[1583px] relative rounded-[20px] sm:rounded-[32px] lg:rounded-[44px] xl:rounded-[50px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.08)] flex flex-col justify-between p-5 sm:p-7 md:p-8 lg:p-12 xl:p-16 h-auto sm:min-h-[420px] lg:min-h-[520px] xl:h-[660px]">
        
        {/* Layer 1: Background Atmospheric Gradient */}
        <img
          className="w-full h-full inset-0 absolute object-cover object-center select-none pointer-events-none"
          src={(footerBgImg as any)?.src || footerBgImg}
          alt="Footer Atmospheric Background"
          draggable={false}
        />

        {/* Layer 2: Model Cutout (Hidden on Mobile & Tablet, fills 100% full vertical height on Desktop) */}
        <div className="hidden lg:flex absolute right-0 top-0 bottom-0 w-[42%] max-w-[620px] h-full pointer-events-none z-10 items-end justify-end">
          <img
            className="w-full h-full object-cover object-top select-none pointer-events-none drop-shadow-[-10px_0_30px_rgba(0,0,0,0.2)]"
            src={(modelHandImg as any)?.src || modelHandImg}
            alt="Chembros Model with Molecule T"
            draggable={false}
          />
        </div>

        {/* Layer 3: Navigation Grid */}
        <div className="relative z-20 w-full max-w-sm sm:max-w-lg lg:max-w-xl xl:max-w-2xl grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          
          {/* THE BRAND */}
          <div className="flex flex-col items-start gap-1 sm:gap-2 lg:gap-3">
            <span className="text-black/80 text-[10px] sm:text-xs lg:text-sm font-normal font-['Conquera',sans-serif] tracking-wider uppercase">
              THE BRAND
            </span>
            <div className="flex flex-col items-start gap-1 sm:gap-1.5 lg:gap-2">
              <Link
                to="/our-story"
                onClick={onOpenStory}
                className="text-white/85 hover:text-white text-[11px] sm:text-xs lg:text-sm font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-tight transition-colors cursor-pointer text-left"
              >
                Our Story
              </Link>
              <button
                type="button"
                onClick={onOpenContact}
                className="text-white/85 hover:text-white text-[11px] sm:text-xs lg:text-sm font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-tight transition-colors cursor-pointer text-left"
              >
                Contact
              </button>
              <Link
                to="/fragrances"
                className="text-white/85 hover:text-white text-[11px] sm:text-xs lg:text-sm font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-tight transition-colors"
              >
                Fragrances
              </Link>
            </div>
          </div>

          {/* DISCOVER */}
          <div className="flex flex-col items-start gap-1 sm:gap-2 lg:gap-3">
            <span className="text-black/80 text-[10px] sm:text-xs lg:text-sm font-normal font-['Conquera',sans-serif] tracking-wider uppercase">
              DISCOVER
            </span>
            <div className="flex flex-col items-start gap-1 sm:gap-1.5 lg:gap-2">
              <Link
                to="/product/molecule-t"
                className="text-white/85 hover:text-white text-[11px] sm:text-xs lg:text-sm font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-tight transition-colors"
              >
                Molecule T
              </Link>
              <Link
                to="/product/molecule-j"
                className="text-white/85 hover:text-white text-[11px] sm:text-xs lg:text-sm font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-tight transition-colors"
              >
                Molecule J
              </Link>
              <Link
                to="/product/molecule-x"
                className="text-white/85 hover:text-white text-[11px] sm:text-xs lg:text-sm font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-tight transition-colors"
              >
                Molecule X
              </Link>
              <Link
                to="/product/molecule-k"
                className="text-white/85 hover:text-white text-[11px] sm:text-xs lg:text-sm font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-tight transition-colors"
              >
                Molecule K
              </Link>
            </div>
          </div>

          {/* CONNECT */}
          <div className="flex flex-col items-start gap-1 sm:gap-2 lg:gap-3 col-span-2 sm:col-span-1">
            <span className="text-black/80 text-[10px] sm:text-xs lg:text-sm font-normal font-['Conquera',sans-serif] tracking-wider uppercase">
              CONNECT
            </span>
            <div className="flex flex-col items-start gap-1 sm:gap-1.5 lg:gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-white/85 hover:text-white text-[11px] sm:text-xs lg:text-sm font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-tight transition-colors"
              >
                Instagram
              </a>
              <button
                type="button"
                onClick={() => onOpenPolicy?.('shipping')}
                className="text-white/85 hover:text-white text-[11px] sm:text-xs lg:text-sm font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-tight transition-colors cursor-pointer text-left whitespace-nowrap"
              >
                Shipping & Returns
              </button>
              <button
                type="button"
                onClick={() => onOpenPolicy?.('privacy')}
                className="text-white/85 hover:text-white text-[11px] sm:text-xs lg:text-sm font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-tight transition-colors cursor-pointer text-left whitespace-nowrap"
              >
                Privacy Policy
              </button>
            </div>
          </div>

        </div>

        {/* Layer 4: Auto-Fitting CHEMBROS Wordmark & Metadata */}
        <div className="relative z-20 w-full flex flex-col gap-2">
          
          <div className="w-full flex items-center select-none pointer-events-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
            <svg
              viewBox="0 0 1000 110"
              className="w-full h-auto max-h-[50px] sm:max-h-[75px] lg:max-h-[105px]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <text
                x="0"
                y="85"
                textLength="100%"
                lengthAdjust="spacingAndGlyphs"
                fill="#ffffff"
                className="font-normal font-['Conquera',sans-serif]"
                fontSize="100"
              >
                CHEMBROS
              </text>
            </svg>
          </div>

          {/* Compact Copyright & Telemetry */}
          <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-black/60 font-mono text-[8.5px] sm:text-[10px] lg:text-xs tracking-wider uppercase pt-2 border-t border-black/10">
            <span>Â© 2026 CHEMBROS ARCHIVE. ALL RIGHTS RESERVED.</span>
            <span>MADURAI [9.9252Â° N, 78.1198Â° E]</span>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer
