import React from 'react'
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
      className={`w-full flex justify-center items-center select-none py-10 ${className}`} 
      style={style}
    >
      {/* 1583x320 — matches frosted card width in HomeProduct (same 1920px artboard scale) */}
      <div
        className="w-[1583px] h-[320px] relative rounded-[50px] overflow-hidden origin-top"
        style={{
          transform: 'scale(min(1, calc(100vw / 1920)))',
          marginBottom: 'calc(320px * (min(1, calc(100vw / 1920)) - 1))',
          marginLeft: 'calc(1583px * (min(1, calc(100vw / 1920)) - 1) / 2)',
          marginRight: 'calc(1583px * (min(1, calc(100vw / 1920)) - 1) / 2)',
        }}
      >
        {/* Layer 1: Background Asset - Guaranteed 100% full coverage */}
        <img
          className="w-full h-full inset-0 absolute object-cover object-center select-none pointer-events-none"
          src={ctaBgImg}
          alt="Atmospheric Blue Background"
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />

        {/* Fallback & Atmospheric Gradient: Also 100% full width */}
        <div
          className="w-full h-full absolute inset-0 pointer-events-none -z-10"
          style={{
            background:
              'linear-gradient(90deg, #628399 0%, #85A3B8 30%, #A4BFD1 70%, #B8CCE0 100%)',
          }}
        />

        {/* Layer 2: Content Alignment */}
        <div className="w-full h-full px-28 sm:px-32 flex justify-between items-center relative z-10">
          
          {/* Left Text Column */}
          <div className="flex flex-col justify-center space-y-2">
            <h2 className="text-white text-[34px] font-normal font-['Conquera',sans-serif] leading-tight tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
              FIND YOUR MOLECULE
            </h2>
            <p className="text-white/90 text-[15px] font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.15)]">
              Distinctive brand language that connects science and fragrance.
            </p>
          </div>

          {/* Right White Pill CTA Button */}
          <Link
            to="/fragrances"
            onClick={onCtaClick}
            className="w-56 h-14 bg-white/95 hover:bg-white active:scale-95 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.12),_inset_0_1px_1px_rgba(255,255,255,0.9)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all duration-300 flex items-center justify-center cursor-pointer group shrink-0"
          >
            <span className="text-black text-[17px] font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-tight group-hover:scale-105 transition-transform duration-300">
              Fragrances
            </span>
          </Link>

        </div>
      </div>
    </section>
  )
}