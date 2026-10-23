import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import cmlogo from '../assets/cmlogo.png'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { User, LogOut, Package, ShieldCheck } from 'lucide-react'

interface NavBarProps {
  className?: string
  style?: React.CSSProperties
}

export default function NavBar({ className = '', style }: NavBarProps) {
  const { itemCount, setIsCartOpen } = useCart()
  const { user, isAuthenticated, isAdmin, logout, setIsAuthModalOpen } = useAuth()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav
      className={`min-w-[540px] max-w-[620px] h-20 px-6 relative bg-neutral-400/80 backdrop-blur-md rounded-full outline outline-1 outline-offset-[-1px] outline-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] select-none z-50 flex items-center justify-between ${className}`}
      style={style}
    >
      {/* Brand Monogram Logo */}
      <Link
        to="/"
        className="w-14 h-9 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        <img
          className="w-full h-full object-contain"
          src={cmlogo}
          alt="Chembros Monogram Logo"
          draggable={false}
        />
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-6">
        <Link
          to="/fragrances"
          className="opacity-70 hover:opacity-100 transition-opacity text-black text-sm font-medium font-['Poppins',sans-serif] tracking-tight cursor-pointer"
        >
          Fragrances
        </Link>
        <Link
          to="/our-story"
          className="opacity-70 hover:opacity-100 transition-opacity text-black text-sm font-medium font-['Poppins',sans-serif] tracking-tight cursor-pointer"
        >
          Our Story
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black text-white text-xs font-medium font-['Poppins',sans-serif] tracking-wider transition-all hover:bg-neutral-800"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </Link>
        )}
      </div>

      {/* Actions: Account & Cart */}
      <div className="flex items-center gap-3">
        {/* User Account Button & Dropdown */}
        <div className="relative" ref={menuRef}>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-10 h-10 rounded-full border border-black/30 flex items-center justify-center text-xs font-semibold font-['Poppins',sans-serif] hover:bg-black/10 transition-all cursor-pointer"
              title={user?.email}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-10 h-10 rounded-full border border-black/30 flex items-center justify-center text-black hover:bg-black/10 transition-all cursor-pointer"
              title="Sign in with Email OTP"
            >
              <User className="w-4 h-4 stroke-[1.5]" />
            </button>
          )}

          {/* User Dropdown Menu */}
          {isUserMenuOpen && isAuthenticated && (
            <div className="absolute right-0 top-12 w-52 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-black/10 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-black/5">
                <p className="text-xs font-semibold text-black truncate">{user?.name || 'Customer'}</p>
                <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
                {isAdmin && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-black text-white">
                    Administrator
                  </span>
                )}
              </div>
              <Link
                to="/my-orders"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-neutral-800 hover:bg-neutral-100 transition-colors"
              >
                <Package className="w-4 h-4 text-neutral-600" />
                My Orders & Tracking
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-neutral-800 hover:bg-neutral-100 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-neutral-600" />
                  Admin Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  logout()
                  setIsUserMenuOpen(false)
                  navigate('/')
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Shopping Cart Pill Button */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="w-16 h-12 rounded-full outline outline-[1.33px] outline-offset-[-1.33px] outline-black cursor-pointer transition-all hover:bg-black/5 active:scale-95 flex items-center justify-center gap-2 px-3 relative"
          aria-label={`View Shopping Cart, ${itemCount} items`}
        >
          {/* Shopping Bag Icon */}
          <svg
            className="w-[18px] h-[18px] text-black shrink-0"
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
              strokeWidth="1.33"
            />
            <path
              d="M7 5.5V4C7 2.62 8.34 1.5 10 1.5C11.66 1.5 13 2.62 13 4V5.5"
              stroke="currentColor"
              strokeWidth="1.33"
              strokeLinecap="round"
            />
            <path
              d="M8.5 9.5H11.5"
              stroke="currentColor"
              strokeWidth="1.33"
              strokeLinecap="round"
            />
          </svg>

          {/* Item Count */}
          <span className="text-center text-black text-sm font-medium font-['Poppins',sans-serif]">
            {itemCount}
          </span>

          {/* Status Dot Accent */}
          <span
            className={`size-2 absolute right-2.5 top-2.5 rounded-full ${
              itemCount > 0 ? 'bg-black' : 'bg-neutral-400'
            }`}
          ></span>
        </button>
      </div>
    </nav>
  )
}
