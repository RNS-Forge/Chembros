import React from 'react'
import { Link } from 'react-router-dom'
import cmlogo from '../assets/cmlogo.png'

interface NavBarProps {
  className?: string
  style?: React.CSSProperties
}

export default function NavBar({ className = '', style }: NavBarProps) {
  return (
    <nav
      className={`w-[502px] h-20 relative bg-neutral-400/80 backdrop-blur-md rounded-full outline outline-1 outline-offset-[-1px] outline-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] select-none z-50 ${className}`}
      style={style}
    >
      {/* Brand Monogram Logo */}
      <Link
        to="/"
        className="w-14 h-9 left-[25px] top-[19px] absolute flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        <img
          className="w-full h-full object-contain"
          src={cmlogo}
          alt="Chembros Monogram Logo"
          draggable={false}
        />
      </Link>

      {/* Nav Links */}
      <div className="left-[128px] top-[29px] absolute inline-flex justify-start items-center gap-7">
        <Link
          to="/fragrances"
          className="opacity-60 hover:opacity-100 transition-opacity justify-center text-black text-base font-medium font-['Poppins',sans-serif] leading-4 tracking-tight cursor-pointer"
        >
          Fragrances
        </Link>
        <Link
          to="/our-story"
          className="opacity-60 hover:opacity-100 transition-opacity justify-center text-black text-base font-medium font-['Poppins',sans-serif] leading-4 tracking-tight cursor-pointer"
        >
          Our Story
        </Link>
      </div>

      {/* Shopping Cart Pill Button */}
      <button
        type="button"
        className="w-16 h-12 left-[403px] top-[13px] absolute rounded-full outline outline-[1.33px] outline-offset-[-1.33px] outline-black cursor-pointer transition-all hover:bg-black/5 active:scale-95"
        aria-label="View Shopping Cart, 1 item"
      >
        {/* Shopping Bag Icon */}
        <div className="w-5 h-5 left-[14px] top-[13px] absolute flex items-center justify-center">
          <svg
            className="w-[18px] h-[18px] text-black"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Bag outline */}
            <rect
              x="3.25"
              y="5.5"
              width="13.5"
              height="12"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.33"
            />
            {/* Curved handle */}
            <path
              d="M7 5.5V4C7 2.62 8.34 1.5 10 1.5C11.66 1.5 13 2.62 13 4V5.5"
              stroke="currentColor"
              strokeWidth="1.33"
              strokeLinecap="round"
            />
            {/* Center lock/notch */}
            <path
              d="M8.5 9.5H11.5"
              stroke="currentColor"
              strokeWidth="1.33"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Item Count */}
        <span className="left-[40px] top-[13px] absolute text-center justify-center text-black text-sm font-medium font-['Poppins',sans-serif] leading-5">
          1
        </span>

        {/* Status Dot Accent */}
        <span className="size-2 left-[52.67px] top-[9.33px] absolute bg-neutral-400 rounded-full"></span>
      </button>
    </nav>
  )
}
