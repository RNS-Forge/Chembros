import React from 'react'
import { Link } from 'react-router-dom'
import footerBgImg from '../assets/footerbg.png'
import modelHandImg from '../assets/footerguy.png'

interface FooterProps {
  onOpenStory?: () => void
  onOpenContact?: () => void
  onOpenPolicy?: (type: 'shipping' | 'privacy' | 'terms') => void
}

export const Footer: React.FC<FooterProps> = ({
  onOpenStory,
  onOpenContact,
  onOpenPolicy,
}) => {
  return (
    <footer className="w-full flex justify-center items-center overflow-x-hidden select-none bg-white py-10">
      {/* 1579x713 Scaled Container (Matches Figma artboard coordinates) */}
      <div
        className="w-[1579px] h-[713px] relative rounded-[50px] overflow-hidden origin-top"
        style={{
          transform: 'scale(min(1, calc((100vw - 32px) / 1579)))',
          marginBottom: 'calc(713px * (min(1, calc((100vw - 32px) / 1579)) - 1))',
        }}
      >
        {/* Layer 1: Soft Blue/Gray Gradient Background */}
        <img
          className="w-[1579px] h-[719px] left-0 -top-[6px] absolute object-cover select-none pointer-events-none"
          src={footerBgImg}
          alt="Footer Atmospheric Background"
          draggable={false}
        />

        {/* Layer 2: Model & Conical Bottle Cutout (Right-aligned over background) */}
        <img
          className="w-[728px] h-[971px] left-[907px] -top-[163px] absolute object-contain select-none pointer-events-none z-10"
          src={modelHandImg}
          alt="Chembros Hand with Molecule T"
          draggable={false}
        />

        {/* Layer 3: Top Navigation Links */}
        <div className="left-[139px] top-[116px] absolute inline-flex justify-start items-start gap-40 z-20">
          
          {/* THE BRAND */}
          <div className="w-44 inline-flex flex-col justify-start items-start gap-7">
            <span className="self-stretch opacity-60 text-black text-base font-normal font-['Conquera',sans-serif] leading-4 tracking-wider uppercase">
              THE BRAND
            </span>
            <div className="w-28 flex flex-col justify-start items-start gap-4">
              <Link
                to="/our-story"
                onClick={onOpenStory}
                className="self-stretch opacity-60 hover:opacity-100 text-left text-white text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-4 tracking-tight transition-opacity cursor-pointer"
              >
                Our Story
              </Link>
              <button
                type="button"
                onClick={onOpenContact}
                className="self-stretch opacity-60 hover:opacity-100 text-left text-white text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-4 tracking-tight transition-opacity cursor-pointer"
              >
                Contact
              </button>
              <Link
                to="/fragrances"
                className="self-stretch opacity-60 hover:opacity-100 text-white text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-4 tracking-tight transition-opacity"
              >
                Fragrances
              </Link>
            </div>
          </div>

          {/* DISCOVER */}
          <div className="w-36 inline-flex flex-col justify-start items-start gap-7">
            <span className="self-stretch opacity-60 text-black text-base font-normal font-['Conquera',sans-serif] leading-4 tracking-wider uppercase">
              DISCOVER
            </span>
            <div className="w-28 flex flex-col justify-start items-start gap-4">
              <Link
                to="/fragrances/molecule-t"
                className="self-stretch opacity-60 hover:opacity-100 text-white text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-4 tracking-tight transition-opacity"
              >
                Molecule T
              </Link>
              <Link
                to="/fragrances/molecule-j"
                className="self-stretch opacity-60 hover:opacity-100 text-white text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-4 tracking-tight transition-opacity"
              >
                Molecule J
              </Link>
              <Link
                to="/fragrances/molecule-x"
                className="self-stretch opacity-60 hover:opacity-100 text-white text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-4 tracking-tight transition-opacity"
              >
                Molecule X
              </Link>
              <Link
                to="/fragrances/molecule-k"
                className="self-stretch opacity-60 hover:opacity-100 text-white text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-4 tracking-tight transition-opacity"
              >
                Molecule K
              </Link>
            </div>
          </div>

          {/* CONNECT */}
          <div className="w-48 inline-flex flex-col justify-start items-start gap-7">
            <span className="self-stretch opacity-60 text-black text-base font-normal font-['Conquera',sans-serif] leading-4 tracking-wider uppercase">
              CONNECT
            </span>
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="self-stretch opacity-60 hover:opacity-100 text-white text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-4 tracking-tight transition-opacity"
              >
                Instagram
              </a>
              <button
                type="button"
                onClick={() => onOpenPolicy?.('shipping')}
                className="self-stretch opacity-60 hover:opacity-100 text-left text-white text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-4 tracking-tight transition-opacity cursor-pointer whitespace-nowrap"
              >
                Shipping and Returns
              </button>
              <button
                type="button"
                onClick={() => onOpenPolicy?.('privacy')}
                className="self-stretch opacity-60 hover:opacity-100 text-left text-white text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-4 tracking-tight transition-opacity cursor-pointer whitespace-nowrap"
              >
                Privacy Policy
              </button>
            </div>
          </div>

        </div>

        {/* Layer 4: Monolithic CHEMBROS Wordmark */}
        <div className="w-[1316px] left-[132px] top-[500px] absolute text-white text-[115px] font-normal font-['Conquera',sans-serif] leading-none tracking-tight pointer-events-none z-20">
          CHEMBROS
        </div>

        {/* Layer 5: Centered Bottom Copyright */}
        <div className="w-full text-center left-0 top-[673px] absolute opacity-60 text-black text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-4 tracking-tight z-20">
          © 2026 CHEMBROS
        </div>
      </div>
    </footer>
  )
}

export default Footer
