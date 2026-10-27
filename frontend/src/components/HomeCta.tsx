import type React from 'react'
import { Link } from 'react-router-dom'
import ctaBgImg from '../assets/footerbg.png'

interface HomeCtaProps {
  className?: string
  style?: React.CSSProperties
  onCtaClick?: () => void
}

export default function HomeCta({ className = '', style, onCtaClick }: HomeCtaProps) {
  return (
    <section 
      className={`w-full flex justify-center items-center select-none py-8 sm:py-12 lg:py-16 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 ${className}`} 
      style={style}
    >
      {/* Container aligned with HomeProduct max-w-[1583px] */}
      <div className="w-full max-w-[1583px] min-h-[220px] sm:min-h-[260px] lg:h-[300px] xl:h-[320px] relative rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] xl:rounded-[50px] overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.08)] flex items-center">
        
        {/* Layer 1: Background Asset */}
        <img
          className="w-full h-full inset-0 absolute object-cover object-center select-none pointer-events-none"
          src={ctaBgImg}
          alt="Atmospheric Blue Background"
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />

        {/* Fallback & Atmospheric Gradient */}
        <div
          className="w-full h-full absolute inset-0 pointer-events-none -z-10"
          style={{
            background:
              'linear-gradient(90deg, #628399 0%, #85A3B8 30%, #A4BFD1 70%, #B8CCE0 100%)',
          }}
        />

        {/* Layer 2: Content Alignment */}
        <div className="w-full h-full px-6 sm:px-10 md:px-14 lg:px-20 xl:px-28 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          
          {/* Left Text Column */}
          <div className="flex flex-col justify-center space-y-1.5 sm:space-y-2 max-w-2xl">
            <h2 className="text-white text-[clamp(20px,2.2vw,34px)] font-normal font-['Conquera',sans-serif] leading-tight tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
              FIND YOUR MOLECULE
            </h2>
            <p className="text-white/90 text-[clamp(13px,1.0vw,16px)] font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.15)]">
              Distinctive brand language that connects science and fragrance.
            </p>
          </div>

          {/* Right White Pill CTA Button */}
          <Link
            to="/fragrances"
            onClick={onCtaClick}
            className="w-full sm:w-48 lg:w-56 h-11 sm:h-12 lg:h-14 bg-white/95 hover:bg-white active:scale-95 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.12),_inset_0_1px_1px_rgba(255,255,255,0.9)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all duration-300 flex items-center justify-center cursor-pointer group shrink-0"
          >
            <span className="text-black text-sm sm:text-base lg:text-[17px] font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-tight group-hover:scale-105 transition-transform duration-300">
              Fragrances
            </span>
          </Link>

        </div>
      </div>
    </section>
  )
}