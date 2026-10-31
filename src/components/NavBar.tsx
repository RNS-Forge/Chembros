'use client'
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import cmlogo from '../assets/blacklogo.png'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import {
  User,
  Package,
  RefreshCw,
  LayoutDashboard,
  HelpCircle,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Plus,
  Minus,
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

  const isAuthRoute =
    location.pathname === '/auth' ||
    location.pathname === '/login' ||
    location.pathname === '/register'

  if (isAuthRoute) {
    return null
  }

  // Desktop States
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const lastScrollY = useRef(0)
  const menuRef = useRef<HTMLDivElement>(null)

  // Mobile Drawer States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)

  const toggleAccordion = (name: string) => {
    setOpenAccordion((prev) => (prev === name ? null : name))
  }

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setOpenAccordion(null)
  }, [location.pathname])

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  // Desktop scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > 50 && currentScrollY > lastScrollY.current) {
        setIsScrolled(true)
      } else if (currentScrollY <= 50 || currentScrollY < lastScrollY.current - 8) {
        setIsScrolled(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Desktop click outside user menu
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

  const [cartBump, setCartBump] = useState(false)
  const prevCount = useRef(displayedCartCount)

  useEffect(() => {
    if (displayedCartCount > prevCount.current) {
      setCartBump(true)
      const timer = setTimeout(() => setCartBump(false), 500)
      return () => clearTimeout(timer)
    }
    prevCount.current = displayedCartCount
  }, [displayedCartCount])

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
    <>
      {/* =========================================================================
          MOBILE NAVBAR HEADER (Screens < 768px)
          ========================================================================= */}
      <header className="md:hidden fixed top-0 left-0 w-full h-[58px] bg-white/95 backdrop-blur-md border-b border-black/5 z-[95] px-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          {/* Hamburger Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 -ml-1 text-black active:scale-90 transition-transform cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6 stroke-[1.75]" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={(cmlogo as any)?.src || cmlogo}
              alt="Chembros"
              className="h-5 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Right Action Icons: Cart */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCartClick}
            className="relative p-2 text-black active:scale-90 transition-transform cursor-pointer"
            aria-label={`Shopping bag, ${displayedCartCount} items`}
          >
            <svg
              className="w-5 h-5"
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
                strokeWidth="1.5"
              />
              <path
                d="M7 5.5V4C7 2.62 8.34 1.5 10 1.5C11.66 1.5 13 2.62 13 4V5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M8.5 9.5H11.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className={`absolute top-1.5 right-1 min-w-[15px] h-[15px] rounded-full bg-black text-white text-[9px] font-mono flex items-center justify-center font-bold px-0.5 transition-all duration-300 ${cartBump ? 'scale-125 bg-neutral-900 shadow-md ring-2 ring-black/20' : 'scale-100'}`}>
              {displayedCartCount}
            </span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          MOBILE SLIDE-OVER DRAWER (Left side drawer matching the UI flow)
          ========================================================================= */}
      {/* Backdrop */}
      <div
        onClick={() => setIsMobileMenuOpen(false)}
        className={`md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-[100] transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Panel */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 w-[82%] max-w-[340px] bg-white z-[101] shadow-2xl flex flex-col justify-between py-6 px-6 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Close Icon Header */}
          <div className="flex justify-end pb-4">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 text-black/80 hover:text-black active:scale-90 transition-transform cursor-pointer"
              aria-label="Close Navigation Menu"
            >
              <X className="w-5 h-5 stroke-[1.8]" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-4 pt-1 font-['Conquera',sans-serif] uppercase tracking-wider text-xs sm:text-[13px]">
            {/* Auth / Account Link */}
            {user ? (
              <div className="flex flex-col border-b border-black/5 pb-3">
                <div className="flex items-center justify-between">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-black font-semibold tracking-wide text-xs">
                        {user.name?.split(' ')[0] || 'My Account'}
                      </span>
                      <span className="text-[10px] text-black/40 font-mono lowercase">
                        {user.email}
                      </span>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      logout()
                    }}
                    className="text-[10px] text-rose-600 font-mono tracking-widest pl-2 cursor-pointer"
                  >
                    LOGOUT
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-black/5 text-[10px] font-mono tracking-wider">
                  <Link
                    to="/dashboard?tab=orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-1.5 px-2 rounded-lg bg-neutral-100 text-black text-center hover:bg-neutral-200 transition-colors"
                  >
                    MY ORDERS
                  </Link>
                  <Link
                    to="/dashboard?tab=repurchase"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-1.5 px-2 rounded-lg bg-neutral-100 text-black text-center hover:bg-neutral-200 transition-colors"
                  >
                    PURCHASE AGAIN
                  </Link>
                  <Link
                    to="/dashboard?tab=overview"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-1.5 px-2 rounded-lg bg-black text-white text-center hover:bg-neutral-800 transition-colors"
                  >
                    DASHBOARD
                  </Link>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  openAuthModal()
                }}
                className="text-left font-normal text-black tracking-widest hover:text-black/60 transition-colors py-1 border-b border-black/5 pb-3"
              >
                LOGIN / REGISTER
              </button>
            )}

            {/* Direct Shop Link */}
            <Link
              to="/fragrances"
              className="text-black hover:text-black/60 transition-colors py-1"
            >
              ALL FRAGRANCES
            </Link>

            {/* Nested Sub-links */}
            <div className="pl-4 flex flex-col space-y-3 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-xs uppercase tracking-wider text-black/80">
              <Link to="/fragrances" className="hover:text-black transition-colors">
                MOLECULE SERIES
              </Link>
              <Link to="/fragrances" className="hover:text-black transition-colors">
                DISCOVERY ARCHIVE
              </Link>
            </div>

            {/* Collapsible Accordion: COLLECTIONS */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => toggleAccordion('collections')}
                className="w-full flex items-center justify-between text-left text-black hover:text-black/60 transition-colors py-1"
              >
                <span>COLLECTIONS</span>
                {openAccordion === 'collections' ? (
                  <Minus className="w-3.5 h-3.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
              </button>

              {openAccordion === 'collections' && (
                <div className="pl-4 pt-2.5 flex flex-col space-y-2.5 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-xs uppercase tracking-wider text-black/70 animate-in fade-in duration-200">
                  <Link to="/fragrances/molecule-x" className="hover:text-black">
                    Molecule X // Floral
                  </Link>
                  <Link to="/fragrances/molecule-t" className="hover:text-black">
                    Molecule T // Amber
                  </Link>
                  <Link to="/fragrances/molecule-j" className="hover:text-black">
                    Molecule J // Citrus
                  </Link>
                  <Link to="/fragrances/molecule-k" className="hover:text-black">
                    Molecule K // Woody
                  </Link>
                </div>
              )}
            </div>

            {/* Collapsible Accordion: GIFTING */}
            <div>
              <button
                type="button"
                onClick={() => toggleAccordion('gifting')}
                className="w-full flex items-center justify-between text-left text-black hover:text-black/60 transition-colors py-1"
              >
                <span>GIFTING</span>
                {openAccordion === 'gifting' ? (
                  <Minus className="w-3.5 h-3.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
              </button>

              {openAccordion === 'gifting' && (
                <div className="pl-4 pt-2.5 flex flex-col space-y-2.5 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-xs uppercase tracking-wider text-black/70 animate-in fade-in duration-200">
                  <Link to="/fragrances/the-discovery-archive" className="hover:text-black">
                    The 4×3ml Discovery Set
                  </Link>
                  <Link to="/fragrances" className="hover:text-black">
                    Bespoke Gift Boxes
                  </Link>
                </div>
              )}
            </div>

            {/* Our Story / Heritage Link */}
            <Link
              to="/our-story"
              className="text-black hover:text-black/60 transition-colors py-1"
            >
              OUR STORY
            </Link>

            {/* Admin portal if applicable */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-black font-semibold flex items-center gap-1.5 hover:text-black/60 transition-colors py-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ADMIN PORTAL</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Drawer Footer Info */}
        <div className="pt-6 border-t border-black/5 flex flex-col space-y-2">
          <Link
            to="/our-story"
            className="text-[11px] font-mono tracking-widest text-black/50 hover:text-black uppercase"
          >
            ABOUT CHEMBROS
          </Link>
          <div className="text-[9px] font-mono text-black/35 uppercase tracking-widest">
            MADURAI · CHENNAI BIO FLORA · 2026
          </div>
        </div>
      </aside>

      {/* =========================================================================
          DESKTOP & TABLET NAVBAR PILL (Screens >= 768px)
          ========================================================================= */}
      <header
        className={`hidden md:block fixed top-4 sm:top-6 lg:top-8 left-4 sm:left-6 md:left-8 lg:left-[clamp(32px,8.95vw,172px)] pointer-events-none z-[100] max-w-[calc(100vw-32px)] transition-all duration-500 ${
          isAuthModalOpen
            ? 'opacity-20 scale-95 blur-xs pointer-events-none'
            : 'opacity-100 scale-100 blur-none'
        }`}
      >
        <nav
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`pointer-events-auto h-[48px] sm:h-[54px] lg:h-[60px] inline-flex items-center rounded-full bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_12px_36px_rgba(0,0,0,0.08),_inset_0_1px_1px_rgba(255,255,255,0.9)] select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-full ${
            isExpanded
              ? 'pr-3.5 sm:pr-5 lg:pr-6 shadow-[0_12px_36px_rgba(0,0,0,0.08)]'
              : 'pr-0 shadow-[0_8px_24px_rgba(0,0,0,0.12)] bg-white/90'
          } ${className}`}
          style={style}
        >
          {/* Logo */}
          <div className="w-[84px] sm:w-[96px] lg:w-[106px] h-full flex items-center justify-center shrink-0">
            <Link
              to="/"
              className="flex items-center justify-center transition-transform duration-300 hover:scale-105 active:scale-95"
              aria-label="Chembros Home"
            >
              <img
                className="h-5 sm:h-6 lg:h-7 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.04)] will-change-transform"
                src={(cmlogo as any)?.src || cmlogo}
                alt="Chembros Monogram"
                draggable={false}
              />
            </Link>
          </div>

          {/* Unfolding Menu Container */}
          <div
            className={`grid transition-[grid-template-columns,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] items-center ${
              isExpanded
                ? 'grid-cols-[1fr] opacity-100 overflow-visible'
                : 'grid-cols-[0fr] opacity-0 pointer-events-none overflow-hidden'
            }`}
          >
            <div
              className={`${
                isExpanded || isUserMenuOpen ? 'overflow-visible' : 'overflow-hidden'
              } flex items-center gap-3 sm:gap-6 lg:gap-8 whitespace-nowrap`}
            >
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
                      className={`relative py-1 text-[11px] sm:text-xs lg:text-[13px] font-medium tracking-wide uppercase font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] transition-colors duration-200 ${
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

              {/* Auth / Profile Trigger */}
              <div className="relative shrink-0" ref={menuRef}>
                {user ? (
                  <div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsUserMenuOpen((prev) => !prev)
                      }}
                      className="flex items-center gap-1.5 py-1 px-1.5 sm:px-2 rounded-full hover:bg-black/5 active:scale-95 text-xs sm:text-[13px] font-medium tracking-wide uppercase font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-black/80 hover:text-black transition-all cursor-pointer select-none"
                      aria-label="User Account Profile Menu"
                      aria-expanded={isUserMenuOpen}
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
                      <span className="hidden sm:inline max-w-[90px] truncate">
                        {user.name?.split(' ')[0] || 'Profile'}
                      </span>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-300 text-black/60 ${
                          isUserMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isUserMenuOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-2.5 w-64 bg-white border border-black/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] py-2 z-[9999] text-xs font-['Inter',sans-serif] pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
                      >
                        <div className="px-4 py-3 border-b border-black/5 bg-neutral-50/70 rounded-t-xl">
                          <div className="flex items-center gap-2.5">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt=""
                                className="w-9 h-9 rounded-full object-cover border border-black/10"
                              />
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

                        <div className="py-1">
                          {/* 1. My Orders */}
                          <Link
                            to="/dashboard?tab=orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:text-black hover:bg-black/5 transition-colors cursor-pointer text-left font-medium"
                          >
                            <Package className="w-3.5 h-3.5 text-neutral-400" />
                            <span>My Orders</span>
                          </Link>

                          {/* 2. Purchase Again */}
                          <Link
                            to="/dashboard?tab=repurchase"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:text-black hover:bg-black/5 transition-colors cursor-pointer text-left font-medium"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Purchase Again</span>
                          </Link>

                          {/* 3. Dashboard */}
                          <Link
                            to="/dashboard?tab=overview"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:text-black hover:bg-black/5 transition-colors cursor-pointer text-left font-medium"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Dashboard</span>
                          </Link>

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
                            <span>Logout</span>
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
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:pl-3 sm:pr-3.5 py-1 sm:py-1.5 lg:py-2 rounded-full border transition-all duration-300 active:scale-95 cursor-pointer shrink-0 ${
                  cartBump
                    ? 'bg-black text-white border-black scale-105 shadow-md'
                    : 'bg-black/5 hover:bg-black text-black hover:text-white border-black/10 hover:border-black'
                }`}
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
                <span className={`text-[11px] sm:text-xs lg:text-[13px] font-mono font-medium leading-none transition-transform duration-300 ${cartBump ? 'scale-110 font-bold' : ''}`}>
                  {displayedCartCount}
                </span>
              </button>
            </div>
          </div>
        </nav>
      </header>
    </>
  )
}