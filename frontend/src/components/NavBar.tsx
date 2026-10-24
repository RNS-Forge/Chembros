import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import cmlogo from '../assets/blacklogo.png'

interface NavBarProps {
  className?: string
  style?: React.CSSProperties
  cartCount?: number
  onOpenCart?: () => void
}

export default function NavBar({
  className = '',
  style,
  cartCount = 1,
  onOpenCart,
}: NavBarProps) {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > 60 && currentScrollY > lastScrollY.current) {
        setIsScrolled(true)
      } else if (currentScrollY <= 60 || currentScrollY < lastScrollY.current - 10) {
        setIsScrolled(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isExpanded = !isScrolled || isHovered

  const navLinks = [
    { label: 'Fragrances', path: '/fragrances' },
    { label: 'Our Story', path: '/our-story' },
  ]

  return (
    <header className="fixed top-8 left-6 lg:left-[172px] pointer-events-none z-[100]">
      <nav
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`pointer-events-auto h-[54px] sm:h-[60px] inline-flex items-center rounded-full bg-white/70 backdrop-blur-2xl border border-white/70 shadow-[0_12px_36px_rgba(0,0,0,0.08),_inset_0_1px_1px_rgba(255,255,255,0.9)] select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isExpanded
            ? 'pr-5 sm:pr-6 shadow-[0_12px_36px_rgba(0,0,0,0.08)]'
            : 'pr-0 shadow-[0_8px_24px_rgba(0,0,0,0.12)] bg-white/85'
        } ${className}`}
        style={style}
      >
        {/* Fixed Width Logo Anchor: Never resizes, shifts, or recalculates */}
        <div className="w-[96px] sm:w-[106px] h-full flex items-center justify-center shrink-0">
          <Link
            to="/"
            className="flex items-center justify-center transition-transform duration-300 hover:scale-105 active:scale-95"
            aria-label="Chembros Home"
          >
            <img
              className="h-6 sm:h-7 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.04)] will-change-transform"
              src={cmlogo}
              alt="Chembros Monogram"
              draggable={false}
            />
          </Link>
        </div>

        {/* Unfolding Menu Container */}
        <div
          className={`grid transition-[grid-template-columns,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] items-center ${
            isExpanded
              ? 'grid-cols-[1fr] opacity-100'
              : 'grid-cols-[0fr] opacity-0 pointer-events-none'
          }`}
        >
          <div className="overflow-hidden flex items-center gap-6 sm:gap-8 whitespace-nowrap">
            {/* Divider */}
            <span className="w-px h-4 bg-black/15 shrink-0" />

            {/* Links */}
            <div className="flex items-center gap-5 sm:gap-7 shrink-0">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative py-1 text-xs sm:text-[13px] font-medium tracking-wide uppercase font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] transition-colors duration-200 ${
                      isActive
                        ? 'text-black opacity-100 font-semibold'
                        : 'text-black/65 hover:text-black hover:opacity-100'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Cart Pill */}
            <button
              type="button"
              onClick={onOpenCart}
              className="flex items-center gap-2 pl-3 pr-3.5 py-1.5 sm:py-2 rounded-full bg-black/5 hover:bg-black text-black hover:text-white border border-black/10 hover:border-black transition-all duration-300 active:scale-95 cursor-pointer shrink-0"
              aria-label={`View Shopping Bag, ${cartCount} items`}
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3.25"
                  y="5.5"
                  width="13.5"
                  height="12"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M7 5.5V4C7 2.62 8.34 1.5 10 1.5C11.66 1.5 13 2.62 13 4V5.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M8.5 9.5H11.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-xs sm:text-[13px] font-mono font-medium leading-none">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}