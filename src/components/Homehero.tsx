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
    id: 'molecule-k',
    name: 'MOLECULE K',
    img: (bottle3 as any)?.src || bottle3,
    desktop: { left: '80.5%', top: '58%' },
    tablet1024: { left: '80.5%', top: '44%' },
  },
]

export default function HomeHero() {
  const [loadingFinished, setLoadingFinished] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const loaderOverlayRef = useRef<HTMLDivElement>(null)
  const loaderTextRef = useRef<HTMLDivElement>(null)
  const heroBgRef = useRef<HTMLImageElement>(null)
  const leftTextRef = useRef<HTMLDivElement>(null)
  const rightMetaRef = useRef<HTMLDivElement>(null)
  const bottleRefs = useRef<(HTMLAnchorElement | null)[]>([])

  // Mobile Animation Targets
  const mobileStaticSlotRef = useRef<HTMLDivElement>(null)
  const mobileFlightCardRef = useRef<HTMLDivElement>(null)
  const mobileFlightImgRef = useRef<HTMLImageElement>(null)
  const mobileFlightBadgesRef = useRef<HTMLDivElement>(null)
  const mobileTextRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isMobile = window.innerWidth < 768

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. MOBILE ANIMATION: Direct Fullscreen-to-Slot Trajectory (No Center Step)
    // ─────────────────────────────────────────────────────────────────────────────
    if (isMobile) {
      const mobileCtx = gsap.context(() => {
        const slot = mobileStaticSlotRef.current
        const card = mobileFlightCardRef.current
        const cardImg = mobileFlightImgRef.current
        const badges = mobileFlightBadgesRef.current
        const text = mobileTextRef.current

        if (!slot || !card || !cardImg || !text) {
          setLoadingFinished(true)
          return
        }

        // Measure destination slot coordinates in page flow
        const slotRect = slot.getBoundingClientRect()
        const targetTop = slotRect.top
        const targetLeft = slotRect.left
        const targetW = slotRect.width
        const targetH = slotRect.height

        const vw = window.innerWidth
        const vh = window.innerHeight

        // Initial setup
        gsap.set(slot, { opacity: 0 })
        gsap.set(text, { opacity: 0, y: 16 })
        gsap.set(badges, { opacity: 0 })

        // Flight card begins exactly at full screen viewport boundaries
        gsap.set(card, {
          position: 'fixed',
          top: 0,
          left: 0,
          width: vw,
          height: vh,
          borderRadius: 0,
          zIndex: 80,
          boxShadow: 'none',
          display: 'block',
        })

        // Image starts locked to full screen dimensions (no scaling)
        gsap.set(cardImg, {
          width: vw,
          height: vh,
          maxWidth: 'none',
          maxHeight: 'none',
          x: 0,
          y: 0,
        })

        const mobileTl = gsap.timeline({
          onComplete: () => {
            // Seamless handoff: reveal static in-flow card, hide flight proxy
            gsap.set(slot, { opacity: 1 })
            gsap.set(card, { display: 'none' })
            setLoadingFinished(true)
            ScrollTrigger.refresh()
            window.dispatchEvent(new CustomEvent('hero-animation-complete'))
          },
        })

        // 1. Hold full-screen view briefly
        mobileTl.to({}, { duration: 0.35 })

        // 2. Direct single-arc tween straight into the slot coordinates
        mobileTl.to(card, {
          top: targetTop,
          left: targetLeft,
          width: targetW,
          height: targetH,
          borderRadius: 28,
          duration: 1.3,
          ease: 'power3.inOut',
        })

        // 3. Counter-translate image synchronously so image does not shift or distort
        mobileTl.to(
          cardImg,
          {
            x: -targetLeft,
            y: -targetTop,
            duration: 1.3,
            ease: 'power3.inOut',
          },
          '<'
        )

        // 4. Reveal badges and editorial text right as card docks
        mobileTl.to(
          badges,
          {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
          },
          '-=0.3'
        ).to(
          text,
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: 'power2.out',
          },
          '-=0.3'
        )
      }, containerRef)

      return () => mobileCtx.revert()
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. DESKTOP / TABLET ANIMATION (>= 768px)
    // ─────────────────────────────────────────────────────────────────────────────
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

          tl.to({}, { duration: 1.8 })

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
  }, [])

  return (
    <section
      ref={containerRef}
      id="home-hero-section"
      className="w-full h-screen h-[100dvh] md:h-[75vh] md:min-h-[640px] md:max-h-[820px] lg:h-screen lg:max-h-none bg-white relative overflow-hidden select-none flex items-start justify-center"
    >
      <NavBar />

      {/* Desktop/Tablet Loading Overlay */}
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
            className="w-full h-full object-cover object-top select-none pointer-events-none absolute inset-0 z-0 will-change-transform"
            src={(angelWaterBg as any)?.src || angelWaterBg}
            alt="Chembros Hero Graphic"
            draggable={false}
          />

          {/* The 4 Bottles */}
          <div className={`absolute inset-0 w-full h-full pointer-events-none ${loadingFinished ? 'z-20' : 'z-[160]'}`}>
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
                  opacity: 0,
                }}
                className="absolute block group cursor-pointer aspect-[1/1.05] will-change-transform pointer-events-auto"
              >
                <img
                  className="w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_14px_28px_rgba(0,0,0,0.22)] group-hover:scale-105 group-hover:-translate-y-1.5 transition-all duration-500 ease-out"
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
            className="absolute left-4 sm:left-6 md:left-8 lg:left-[clamp(32px,8.95vw,172px)] top-[14%] md:top-[16%] lg:top-[22%] z-30 flex flex-col items-start max-w-[42%] lg:max-w-[34%] pointer-events-auto will-change-transform"
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
            className="absolute right-[4%] lg:right-[5%] top-[16%] md:top-[18%] lg:top-[24%] z-30 flex flex-col items-end text-right pointer-events-none will-change-transform"
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
          MOBILE VIEWPORT (< 768px): Direct Shrink to Slot
          ========================================================================= */}
      <div className="md:hidden flex flex-col w-full h-full pt-20 pb-8 px-5 relative z-10 justify-center overflow-hidden">
        
        {/* Animated Flight Overlay: travels straight to slot position */}
        <div
          ref={mobileFlightCardRef}
          className="overflow-hidden shadow-2xl border border-black/5 will-change-transform pointer-events-none"
        >
          <img
            ref={mobileFlightImgRef}
            className="object-cover object-center select-none pointer-events-none will-change-transform"
            src={DEFAULT_MOBILE_PORTRAIT}
            alt="Chembros Mobile Animation"
            draggable={false}
          />
          <div
            ref={mobileFlightBadgesRef}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-3.5 left-4 right-4 flex justify-between items-end text-[9px] font-mono tracking-widest text-white/90 uppercase">
              <span>ARCHIVE // 2026</span>
              <span>MADURAI · PARIS</span>
            </div>
          </div>
        </div>

        {/* Static In-Flow Card: reserves exact slot */}
        <div
          ref={mobileStaticSlotRef}
          className="w-full h-[310px] sm:h-[350px] relative rounded-[28px] overflow-hidden shadow-2xl border border-black/5 shrink-0 mb-6"
        >
          <img
            className="w-full h-full object-cover object-center select-none pointer-events-none"
            src={DEFAULT_MOBILE_PORTRAIT}
            alt="Chembros Mobile Editorial"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3.5 left-4 right-4 flex justify-between items-end text-[9px] font-mono tracking-widest text-white/90 uppercase pointer-events-none">
            <span>ARCHIVE // 2026</span>
            <span>MADURAI · PARIS</span>
          </div>
        </div>

        {/* Editorial Text & CTA */}
        <div ref={mobileTextRef} className="flex flex-col will-change-transform relative z-0">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-black/60 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>04 SCENTS // INFINITE POSSIBILITIES</span>
          </div>
          
          <h1 className="text-black text-2xl font-normal font-['Conquera',sans-serif] leading-tight uppercase tracking-wider">
            Chemistry captured
          </h1>
          <span className="text-xl font-light font-['FONTSPRING_DEMO_-_Pockota_Light','serif'] italic text-black/90">
            in a bottle.
          </span>
          <p className="text-black/70 text-xs font-thin font-['FONTSPRING_DEMO_-_Lufga_Thin','Poppins',sans-serif] leading-relaxed mt-1.5">
            Where science meets scent. Explore our molecular series.
          </p>

          <Link
            to="/fragrances"
            className="w-full h-12 bg-black active:scale-95 text-white rounded-2xl flex items-center justify-center font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-xs uppercase tracking-wider shadow-lg transition-all mt-4"
          >
            Explore collection
          </Link>
        </div>

      </div>
    </section>
  )
}