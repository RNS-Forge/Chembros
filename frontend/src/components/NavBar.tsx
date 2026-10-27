import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import cmlogo from '../assets/blacklogo.png'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import {
  User,
  Camera,
  Lock,
  HelpCircle,
  Package,
  ShieldCheck,
  LogOut,
  ChevronDown,
} from 'lucide-react'

interface NavBarProps {
  className?: string
  style?: React.CSSProperties
  cartCount?: number
  onOpenCart?: () => void
}

export default function NavBar({
  className = '',
  style,
  cartCount,
  onOpenCart,
}: NavBarProps) {
  const location = useLocation()
  const { totalItems, openCart } = useCart()
  const { user, openAuthModal, logout, isAuthModalOpen, openProfileModal } = useAuth()

  const isAuthRoute = location.pathname === '/auth' || location.pathname === '/login' || location.pathname === '/register'

  if (isAuthRoute) {
    return null
  }

  const [isScrolled, setIsScrolled] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const lastScrollY = useRef(0)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Collapse when scrolling down past 50px
      if (currentScrollY > 50 && currentScrollY > lastScrollY.current) {
        setIsScrolled(true)
      } else if (currentScrollY <= 50 || currentScrollY < lastScrollY.current - 8) {
        // Expand when scrolling up or back at the top
        setIsScrolled(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isExpanded = !isScrolled || isHovered
  const displayedCartCount = cartCount !== undefined ? cartCount : totalItems

  const handleCartClick = () => {
    if (onOpenCart) {
      onOpenCart()
    } else {
      openCart()
    }
  }

  const navLinks = [
    { label: 'Fragrances', path: '/fragrances' },
    { label: 'Our Story', path: '/our-story' },
    ...(user?.role === 'admin' ? [{ label: 'Admin', path: '/admin' }] : []),
  ]

  return (
    <header className={`fixed top-4 sm:top-6 lg:top-8 left-4 sm:left-6 md:left-8 lg:left-[clamp(32px,8.95vw,172px)] pointer-events-none z-[100] max-w-[calc(100vw-32px)] transition-all duration-500 ${isAuthModalOpen ? 'opacity-20 scale-95 blur-xs pointer-events-none' : 'opacity-100 scale-100 blur-none'}`}>
      <nav
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`pointer-events-auto h-[48px] sm:h-[54px] lg:h-[60px] inline-flex items-center rounded-full bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_12px_36px_rgba(0,0,0,0.08),_inset_0_1px_1px_rgba(255,255,255,0.9)] select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-full ${isExpanded
            ? 'pr-3.5 sm:pr-5 lg:pr-6 shadow-[0_12px_36px_rgba(0,0,0,0.08)]'
            : 'pr-0 shadow-[0_8px_24px_rgba(0,0,0,0.12)] bg-white/90'
          } ${className}`}
        style={style}
      >
        {/* Fixed Width Logo Anchor: Stays centered with rock-solid stability */}
        <div className="w-[84px] sm:w-[96px] lg:w-[106px] h-full flex items-center justify-center shrink-0">
          <Link
            to="/"
            className="flex items-center justify-center transition-transform duration-300 hover:scale-105 active:scale-95"
            aria-label="Chembros Home"
          >
            <img
              className="h-5 sm:h-6 lg:h-7 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.04)] will-change-transform"
              src={cmlogo}
              alt="Chembros Monogram"
              draggable={false}
            />
          </Link>
        </div>

        {/* Unfolding Menu Container */}
        <div
          className={`grid transition-[grid-template-columns,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] items-center ${isExpanded
              ? 'grid-cols-[1fr] opacity-100'
              : 'grid-cols-[0fr] opacity-0 pointer-events-none'
            }`}
        >
          <div className="overflow-hidden flex items-center gap-3 sm:gap-6 lg:gap-8 whitespace-nowrap">
            {/* Divider */}
            <span className="w-px h-3.5 sm:h-4 bg-black/15 shrink-0" />

            {/* Links */}
            <div className="flex items-center gap-3.5 sm:gap-5 lg:gap-7 shrink-0">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative py-1 text-[11px] sm:text-xs lg:text-[13px] font-medium tracking-wide uppercase font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] transition-colors duration-200 ${isActive
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

            {/* Auth / Profile Trigger */}
            <div className="relative shrink-0" ref={menuRef}>
              {user ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 py-1 px-1.5 sm:px-2 rounded-full hover:bg-black/5 active:scale-95 text-xs sm:text-[13px] font-medium tracking-wide uppercase font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-black/80 hover:text-black transition-all cursor-pointer"
                    aria-label="User Account Profile Menu"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name || 'Profile'}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-black/15 shadow-xs"
                      />
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center uppercase">
                        {user.name ? user.name.charAt(0) : 'C'}
                      </div>
                    )}
                    <span className="hidden sm:inline max-w-[90px] truncate">{user.name?.split(' ')[0] || 'Profile'}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 text-black/60 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-64 bg-white/95 backdrop-blur-2xl border border-black/10 rounded-2xl shadow-2xl py-2 z-50 text-xs font-['Inter',sans-serif] animate-in fade-in zoom-in-95 duration-200">
                      {/* User Header */}
                      <div className="px-4 py-3 border-b border-black/5 bg-neutral-50/70 rounded-t-xl">
                        <div className="flex items-center gap-2.5">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-black/10" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-black truncate uppercase text-[11px] font-['Cinzel',serif]">
                              {user.name || 'Client Specimen'}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono truncate">
                              {user.email}
                            </div>
                            <span className="inline-block mt-0.5 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/5 text-black/70">
                              {user.role === 'admin' ? 'Master Admin' : 'Member'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            openProfileModal('details')
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:text-black hover:bg-black/5 transition-colors cursor-pointer text-left font-medium"
                        >
                          <User className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Edit Profile</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            openProfileModal('avatar')
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:text-black hover:bg-black/5 transition-colors cursor-pointer text-left font-medium"
                        >
                          <Camera className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Upload Photo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            openProfileModal('security')
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:text-black hover:bg-black/5 transition-colors cursor-pointer text-left font-medium"
                        >
                          <Lock className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Change Password</span>
                        </button>

                        <Link
                          to="/my-orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:text-black hover:bg-black/5 transition-colors cursor-pointer font-medium"
                        >
                          <Package className="w-3.5 h-3.5 text-neutral-400" />
                          <span>My Orders</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            openProfileModal('help')
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:text-black hover:bg-black/5 transition-colors cursor-pointer text-left font-medium"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Help & Concierge</span>
                        </button>

                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:text-black hover:bg-black/5 transition-colors cursor-pointer font-medium"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-black" />
                            <span>Admin Portal</span>
                          </Link>
                        )}
                      </div>

                      {/* Sign Out */}
                      <div className="border-t border-black/5 pt-1 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            logout()
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-full hover:bg-black/5 active:scale-95 text-xs sm:text-[13px] font-medium tracking-wide uppercase font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-black/75 hover:text-black transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-black/60" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Cart Pill */}
            <button
              type="button"
              onClick={handleCartClick}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:pl-3 sm:pr-3.5 py-1 sm:py-1.5 lg:py-2 rounded-full bg-black/5 hover:bg-black text-black hover:text-white border border-black/10 hover:border-black transition-all duration-300 active:scale-95 cursor-pointer shrink-0"
              aria-label={`View Shopping Bag, ${displayedCartCount} items`}
            >
              <svg
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 transition-colors"
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
              <span className="text-[11px] sm:text-xs lg:text-[13px] font-mono font-medium leading-none">
                {displayedCartCount}
              </span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}