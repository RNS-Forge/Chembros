'use client'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import NavBar from './NavBar'

// Assets
import angelWaterBg from '../assets/hero.png'
import bottle1 from '../assets/bg/1.png'
import bottle2 from '../assets/bg/2.png'
import bottle3 from '../assets/bg/3.png'
import bottle4 from '../assets/bg/4.png'
import MobileA from '../assets/bg/mobile.png'

const DEFAULT_MOBILE_PORTRAIT = (MobileA as any)?.src || MobileA

gsap.registerPlugin(ScrollTrigger)

interface BottleConfig {
  id: string
  name: string
  img: string
  desktop: { left: string; top: string }
  tablet1024: { left: string; top: string }
}

const BOTTLES: BottleConfig[] = [
  {
    id: 'molecule-x',
    name: 'MOLECULE X',
    img: (bottle1 as any)?.src || bottle1,
    desktop: { left: '8.5%', top: '58%' },
    tablet1024: { left: '8.5%', top: '44%' },
  },
  {
    id: 'molecule-t',
    name: 'MOLECULE T',
    img: (bottle2 as any)?.src || bottle2,
    desktop: { left: '32.5%', top: '64%' },
    tablet1024: { left: '32.5%', top: '50%' },
  },
  {
    id: 'molecule-j',
    name: 'MOLECULE J',
    img: (bottle4 as any)?.src || bottle4,
    desktop: { left: '56.5%', top: '64%' },
    tablet1024: { left: '56.5%', top: '50%' },
  },
  {
    id: 'molecule-r',
    name: 'MOLECULE R',
    img: (bottle3 as any)?.src || bottle3,
    desktop: { left: '80.5%', top: '58%' },
    tablet1024: { left: '80.5%', top: '44%' },
  },
]

export default function HomeHero() {
  // Check if user has already seen the animation in this browser session
  const [hasAnimated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem('chembros_hero_animated') === 'true'
  })

  const [loadingFinished, setLoadingFinished] = useState(hasAnimated)

  const containerRef = useRef<HTMLDivElement>(null)
  const loaderOverlayRef = useRef<HTMLDivElement>(null)
  const loaderTextRef = useRef<HTMLDivElement>(null)
  const heroBgRef = useRef<HTMLImageElement>(null)
  const leftTextRef = useRef<HTMLDivElement>(null)
  const rightMetaRef = useRef<HTMLDivElement>(null)
  const bottleRefs = useRef<(HTMLAnchorElement | null)[]>([])

  // Mobile Animation Targets
  const mobileMaskLayerRef = useRef<HTMLDivElement>(null)
  const mobileTargetSlotRef = useRef<HTMLDivElement>(null)
  const mobileStaticImgRef = useRef<HTMLImageElement>(null)
  const mobileStaticBadgesRef = useRef<HTMLDivElement>(null)
  const mobileBadgesRef = useRef<HTMLDivElement>(null)
  const mobileTextRef = useRef<HTMLDivElement>(null)
  const mobileFooterMetaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isMobile = window.innerWidth < 768

    // ─────────────────────────────────────────────────────────────────────────────
    // SCENARIO A: Already Animated in Session (Skip Immediately)
    // ─────────────────────────────────────────────────────────────────────────────
    if (hasAnimated) {
      setLoadingFinished(true)
      ScrollTrigger.refresh()
      window.dispatchEvent(new CustomEvent('hero-animation-complete'))

      if (isMobile) {
        if (mobileMaskLayerRef.current) gsap.set(mobileMaskLayerRef.current, { display: 'none' })
        if (mobileStaticImgRef.current) gsap.set(mobileStaticImgRef.current, { opacity: 1 })
        if (mobileStaticBadgesRef.current) gsap.set(mobileStaticBadgesRef.current, { opacity: 1 })
        if (mobileTextRef.current) gsap.set(mobileTextRef.current, { opacity: 1, y: 0 })
        if (mobileFooterMetaRef.current) gsap.set(mobileFooterMetaRef.current, { opacity: 1 })
      } else {
        if (loaderOverlayRef.current) gsap.set(loaderOverlayRef.current, { display: 'none' })
        if (heroBgRef.current) gsap.set(heroBgRef.current, { opacity: 1, y: 0, scale: 1 })
        if (leftTextRef.current) gsap.set(leftTextRef.current, { opacity: 1, y: 0 })
        if (rightMetaRef.current) gsap.set(rightMetaRef.current, { opacity: 1, y: 0 })

        const isTablet1024 = window.innerWidth >= 768 && window.innerWidth <= 1180
        BOTTLES.forEach((bottle, idx) => {
          const el = bottleRefs.current[idx]
          if (!el) return
          const targetPos = isTablet1024 ? bottle.tablet1024 : bottle.desktop
          gsap.set(el, {
            xPercent: 0,
            yPercent: 0,
            left: targetPos.left,
            top: targetPos.top,
            scale: 1,
            opacity: 1,
          })
        })
      }
      return
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // SCENARIO B: First Visit — Run Intro & Save Session
    // ─────────────────────────────────────────────────────────────────────────────

    // 1. MOBILE ANIMATION (< 768px)
    if (isMobile) {
      const mobileCtx = gsap.context(() => {
        const maskLayer = mobileMaskLayerRef.current
        const slot = mobileTargetSlotRef.current
        const staticImg = mobileStaticImgRef.current
        const staticBadges = mobileStaticBadgesRef.current
        const badges = mobileBadgesRef.current
        const text = mobileTextRef.current
        const footerMeta = mobileFooterMetaRef.current

        if (!maskLayer || !slot || !text || !badges) {
          setLoadingFinished(true)
          sessionStorage.setItem('chembros_hero_animated', 'true')
          return
        }

        const rect = slot.getBoundingClientRect()
        const topInset = rect.top
        const leftInset = rect.left
        const rightInset = window.innerWidth - rect.right
        const bottomInset = window.innerHeight - rect.bottom

        gsap.set(text, { opacity: 0, y: 15 })
        gsap.set(badges, { opacity: 0 })
        if (footerMeta) gsap.set(footerMeta, { opacity: 0 })
        if (staticImg) gsap.set(staticImg, { opacity: 0 })
        if (staticBadges) gsap.set(staticBadges, { opacity: 0 })

        gsap.set(maskLayer, {
          clipPath: 'inset(0px 0px 0px 0px round 0px)',
          opacity: 1,
          visibility: 'visible',
          display: 'block',
        })

        const mobileTl = gsap.timeline({
          onComplete: () => {
            if (staticImg) gsap.set(staticImg, { opacity: 1 })
            if (staticBadges) gsap.set(staticBadges, { opacity: 1 })
            gsap.set(maskLayer, { display: 'none' })

            setLoadingFinished(true)
            sessionStorage.setItem('chembros_hero_animated', 'true')
            ScrollTrigger.refresh()
            window.dispatchEvent(new CustomEvent('hero-animation-complete'))
          },
        })

        // Hold full-screen
        mobileTl.to({}, { duration: 0.9 })

        // Shrink into card
        mobileTl.to(maskLayer, {
          clipPath: `inset(${topInset}px ${rightInset}px ${bottomInset}px ${leftInset}px round 28px)`,
          duration: 1.3,
          ease: 'power3.inOut',
        })

        // Reveal textual elements
        mobileTl
          .to(
            badges,
            {
              opacity: 1,
              duration: 0.35,
              ease: 'power2.out',
            },
            '-=0.3'
          )
          .to(
            text,
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              ease: 'power2.out',
            },
            '-=0.3'
          )

        if (footerMeta) {
          mobileTl.to(
            footerMeta,
            {
              opacity: 1,
              duration: 0.45,
              ease: 'power2.out',
            },
            '-=0.2'
          )
        }
      }, containerRef)

      return () => mobileCtx.revert()
    }

    // 2. DESKTOP / TABLET ANIMATION (>= 768px)
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          isTablet1024: '(min-width: 768px) and (max-width: 1180px)',
          isDesktop: '(min-width: 1181px)',
        },
        (context) => {
          const { isTablet1024 } = context.conditions as { isTablet1024: boolean }

          const tl = gsap.timeline({
            onComplete: () => {
              setLoadingFinished(true)
              sessionStorage.setItem('chembros_hero_animated', 'true')
              ScrollTrigger.refresh()
              window.dispatchEvent(new CustomEvent('hero-animation-complete'))
            },
          })

          gsap.set(heroBgRef.current, { y: 40, scale: 1.02, opacity: 0 })
          gsap.set(leftTextRef.current, { y: 35, opacity: 0 })
          gsap.set(rightMetaRef.current, { y: 25, opacity: 0 })

          bottleRefs.current.forEach((el, index) => {
            if (!el) return
            gsap.set(el, {
              xPercent: -50,
              yPercent: -50,
              left: '50%',
              top: '50%',
              scale: 0.9 + index * 0.04,
              zIndex: 160 + index,
              opacity: 0,
            })
          })

          tl.to(bottleRefs.current, {
            opacity: 1,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power2.out',
          }).to(
            loaderTextRef.current,
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power2.out',
            },
            '-=0.4'
          )

          tl.to({}, { duration: 1.5 })

          tl.to(loaderTextRef.current, {
            opacity: 0,
            y: -15,
            duration: 0.5,
            ease: 'power2.in',
          }).to(
            loaderOverlayRef.current,
            {
              opacity: 0,
              duration: 1.0,
              ease: 'power3.inOut',
            },
            '-=0.2'
          )

          tl.to(
            heroBgRef.current,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1.6,
              ease: 'power3.out',
            },
            '-=0.9'
          )

          BOTTLES.forEach((bottle, idx) => {
            const el = bottleRefs.current[idx]
            if (!el) return

            const targetPos = isTablet1024 ? bottle.tablet1024 : bottle.desktop

            tl.to(
              el,
              {
                xPercent: 0,
                yPercent: 0,
                left: targetPos.left,
                top: targetPos.top,
                scale: 1,
                duration: 1.8,
                ease: 'power4.out',
              },
              idx === 0 ? '-=1.4' : '-=1.6'
            )
          })

          tl.to(
            leftTextRef.current,
            {
              y: 0,
              opacity: 1,
              duration: 1.2,
              ease: 'power3.out',
            },
            '-=1.2'
          ).to(
            rightMetaRef.current,
            {
              y: 0,
              opacity: 1,
              duration: 1.2,
              ease: 'power3.out',
            },
            '-=1.0'
          )
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [hasAnimated])

  return (
    <section
      ref={containerRef}
      id="home-hero-section"
      className="w-full h-[100dvh] md:h-[75vh] md:min-h-[640px] md:max-h-[820px] lg:h-screen lg:max-h-none bg-white relative select-none flex items-start justify-center"
    >
      <NavBar />

      {/* Desktop/Tablet Loading Overlay: only rendered during the very first visit */}
      {!loadingFinished && (
        <div
          ref={loaderOverlayRef}
          className="hidden md:flex fixed inset-0 w-screen h-screen bg-white z-[150] pointer-events-none flex-col items-center justify-between py-12"
        >
          <div className="text-[11px] font-mono tracking-[0.3em] uppercase text-black/40">
            CHEMBROS
          </div>

          <div
            ref={loaderTextRef}
            className="opacity-0 translate-y-3 flex flex-col items-center gap-2.5 mb-16 text-center"
          >
            <div className="flex items-center gap-2 text-xs font-mono tracking-[0.25em] uppercase text-black">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Loading</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DESKTOP & TABLET ARTBOARD (>= 768px)
          ========================================================================= */}
      <div className="hidden md:flex w-full h-full relative items-start justify-center overflow-hidden">
        <div className="relative w-full h-full max-w-[1920px] flex items-start justify-center overflow-hidden">
          
          <img
            ref={heroBgRef}
            className={`w-full h-full object-cover object-top select-none pointer-events-none absolute inset-0 z-0 will-change-transform ${
              loadingFinished ? 'opacity-100' : 'opacity-0'
            }`}
            src={(angelWaterBg as any)?.src || angelWaterBg}
            alt="Chembros Hero Graphic"
            draggable={false}
          />

          {/* The 4 Bottles */}
          <div
            className={`absolute inset-0 w-full h-full ${
              loadingFinished ? 'z-20 pointer-events-auto' : 'z-[160] pointer-events-none'
            }`}
          >
            {BOTTLES.map((bottle, idx) => (
              <Link
                key={bottle.id}
                id={idx === 2 ? 'hero-scroll-bottle-3' : undefined}
                to={`/fragrances/${bottle.id}`}
                ref={(el) => {
                  bottleRefs.current[idx] = el
                }}
                style={{
                  width: 'clamp(135px, 14vw, 250px)',
                  opacity: loadingFinished ? 1 : 0,
                  left: loadingFinished ? bottle.desktop.left : '50%',
                  top: loadingFinished ? bottle.desktop.top : '50%',
                }}
                className={`absolute block aspect-[1/1.05] will-change-transform transition-none ${
                  loadingFinished
                    ? 'group cursor-pointer pointer-events-auto'
                    : 'pointer-events-none'
                }`}
              >
                <img
                  className={`w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_14px_28px_rgba(0,0,0,0.22)] ${
                    loadingFinished
                      ? 'group-hover:scale-105 group-hover:-translate-y-1.5 transition-all duration-500 ease-out'
                      : ''
                  }`}
                  src={bottle.img}
                  alt={bottle.name}
                  draggable={false}
                />
              </Link>
            ))}
          </div>

          {/* Left Text */}
          <div
            ref={leftTextRef}
            className={`absolute left-4 sm:left-6 md:left-8 lg:left-[clamp(32px,8.95vw,172px)] top-[14%] md:top-[16%] lg:top-[22%] z-30 flex flex-col items-start max-w-[42%] lg:max-w-[34%] pointer-events-auto will-change-transform ${
              loadingFinished ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <h1 className="text-black text-[clamp(22px,2.5vw,46px)] font-normal font-['Conquera',sans-serif] leading-[1.08] uppercase tracking-wider">
              Chemistry captured
            </h1>
            <div className="text-black text-[clamp(20px,2.3vw,42px)] font-light font-['FONTSPRING_DEMO_-_Pockota_Light','serif'] leading-[1.15] italic mt-0.5">
              in a bottle.
            </div>
            <p className="text-black/75 text-[clamp(11px,0.95vw,16px)] font-thin font-['FONTSPRING_DEMO_-_Lufga_Thin','Poppins',sans-serif] leading-relaxed tracking-wide mt-2 max-w-[340px]">
              Where science meets scent. Explore our molecular series.
            </p>

            <Link
              to="/fragrances"
              className="mt-3 lg:mt-4 px-5 lg:px-8 py-2 lg:py-3 bg-black hover:bg-neutral-800 active:scale-95 text-white text-[clamp(11px,0.85vw,14px)] font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-wider uppercase rounded-full shadow-lg transition-all duration-300 group"
            >
              <span className="group-hover:scale-105 inline-block transition-transform duration-300">
                Explore collection
              </span>
            </Link>
          </div>

          {/* Right Meta */}
          <div
            ref={rightMetaRef}
            className={`absolute right-[4%] lg:right-[5%] top-[16%] md:top-[18%] lg:top-[24%] z-30 flex flex-col items-end text-right pointer-events-none will-change-transform ${
              loadingFinished ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="inline-flex items-center gap-1.5 text-black/80 font-mono text-[clamp(8px,0.65vw,11px)] tracking-[0.25em] uppercase mb-1">
              <span>4 SCENTS INFINITE POSSIBILITIES</span>
            </div>
            <div className="text-[clamp(8px,0.55vw,10px)] font-mono tracking-widest text-black/50 uppercase">
              PURE EXTRAIT
            </div>
            <div className="text-[clamp(7px,0.5vw,9px)] font-mono tracking-widest text-black/40 uppercase mt-0.5">
              MADURAI
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE VIEWPORT (< 768px)
          ========================================================================= */}

      {/* Mobile Mask Overlay: only active during the very first visit */}
      {!loadingFinished && (
        <div
          ref={mobileMaskLayerRef}
          className="md:hidden fixed inset-0 w-screen h-screen z-50 pointer-events-none overflow-hidden will-change-[clip-path]"
        >
          <img
            className="w-screen h-screen object-cover object-[center_20%] select-none pointer-events-none"
            src={DEFAULT_MOBILE_PORTRAIT}
            alt="Chembros Mobile Editorial"
            draggable={false}
          />
          <div
            ref={mobileBadgesRef}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-3.5 left-4 right-4 flex justify-between items-end text-[9px] font-mono tracking-widest text-white/90 uppercase">
              <span>ARCHIVE // 2026</span>
              <span>MADURAI · PARIS</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Resting In-Flow Viewport */}
      <div className="md:hidden flex flex-col w-full h-[100dvh] pt-20 pb-5 px-5 relative z-10 justify-between">
        
        {/* Top: Resting in-flow card */}
        <div
          ref={mobileTargetSlotRef}
          className="w-full h-[min(48vh,380px)] min-h-[290px] relative rounded-[28px] shrink-0 border border-black/5 shadow-2xl overflow-hidden bg-neutral-100"
        >
          <img
            ref={mobileStaticImgRef}
            className={`w-full h-full object-cover object-[center_20%] select-none pointer-events-none transition-opacity duration-300 ${
              loadingFinished ? 'opacity-100' : 'opacity-0'
            }`}
            src={DEFAULT_MOBILE_PORTRAIT}
            alt="Chembros Mobile Editorial"
            draggable={false}
          />
          <div
            ref={mobileStaticBadgesRef}
            className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
              loadingFinished ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-3.5 left-4 right-4 flex justify-between items-end text-[9px] font-mono tracking-widest text-white/90 uppercase">
              <span>ARCHIVE // 2026</span>
              <span>MADURAI · PARIS</span>
            </div>
          </div>
        </div>

        {/* Middle: Editorial Text & CTA */}
        <div
          ref={mobileTextRef}
          className={`flex flex-col will-change-transform relative z-0 my-auto ${
            loadingFinished ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-black/60 mb-2">
            <span>4 SCENTS INFINITE POSSIBILITIES</span>
          </div>
          
          <h1 className="text-black text-[clamp(22px,6vw,28px)] font-normal font-['Conquera',sans-serif] leading-[1.12] uppercase tracking-wider">
            Chemistry captured
          </h1>
          <span className="text-[clamp(19px,5vw,24px)] font-light font-['FONTSPRING_DEMO_-_Pockota_Light','serif'] italic text-black/90">
            in a bottle.
          </span>
          <p className="text-black/70 text-xs font-thin font-['FONTSPRING_DEMO_-_Lufga_Thin','Poppins',sans-serif] leading-relaxed mt-1.5 max-w-sm">
            Where science meets scent. Explore our molecular series.
          </p>

          <Link
            to="/fragrances"
            className="w-full h-12 bg-black active:scale-95 text-white rounded-2xl flex items-center justify-center font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-xs uppercase tracking-wider shadow-lg transition-all mt-4"
          >
            Explore collection
          </Link>
        </div>

        {/* Bottom Editorial Strip */}
        <div
          ref={mobileFooterMetaRef}
          className={`w-full pt-3 flex items-center justify-between text-[9px] font-mono tracking-widest text-black/45 uppercase shrink-0 ${
            loadingFinished ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="flex items-center gap-1 text-black/70 font-semibold animate-bounce">
            <span>SCROLL</span>
            <span>↓</span>
          </span>
        </div>

      </div>
    </section>
  )
}