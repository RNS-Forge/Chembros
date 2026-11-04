'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
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
  const [animKey, setAnimKey] = useState<number>(0)
  const [loadingFinished, setLoadingFinished] = useState<boolean>(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const heroBgRef = useRef<HTMLImageElement>(null)
  const leftTextRef = useRef<HTMLDivElement>(null)
  const rightMetaRef = useRef<HTMLDivElement>(null)
  const bottleRefs = useRef<(HTMLAnchorElement | null)[]>([])

  // Mobile Cinematic Targets
  const mobileCardSlotRef = useRef<HTMLDivElement>(null)
  const mobileCardRef = useRef<HTMLDivElement>(null)
  const mobileCardImgRef = useRef<HTMLImageElement>(null)
  const mobileCurtainRef = useRef<HTMLDivElement>(null)
  const mobileBadgesRef = useRef<HTMLDivElement>(null)
  const mobileHeadlineRef = useRef<HTMLHeadingElement>(null)
  const mobileItalicRef = useRef<HTMLDivElement>(null)
  const mobileSubRef = useRef<HTMLParagraphElement>(null)
  const mobileCtaRef = useRef<HTMLDivElement>(null)
  const mobileMetaRef = useRef<HTMLDivElement>(null)

  const notifyComplete = useCallback(() => {
    setLoadingFinished(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('chembros_hero_animated', 'true')
      window.dispatchEvent(new CustomEvent('hero-animation-complete'))
      ScrollTrigger.refresh()
    }
  }, [])

  const handleReplayAnimation = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('chembros_hero_animated')
    }
    setLoadingFinished(false)
    setAnimKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const alreadyAnimated =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('chembros_hero_animated') === 'true'

    // Fallback timer: unlock within 2.5s regardless of browser/render quirks
    const watchdogTimer = setTimeout(() => {
      notifyComplete()
    }, 2500)

    // ─────────────────────────────────────────────────────────────────────────────
    // SCENARIO A: Already Animated in Session (Instant Layout)
    // ─────────────────────────────────────────────────────────────────────────────
    if (alreadyAnimated) {
      clearTimeout(watchdogTimer)
      notifyComplete()

      if (isMobile) {
        if (mobileCardRef.current) gsap.set(mobileCardRef.current, { clearProps: 'all' })
        if (mobileCardImgRef.current) gsap.set(mobileCardImgRef.current, { clearProps: 'all' })
        if (mobileCurtainRef.current) gsap.set(mobileCurtainRef.current, { opacity: 0 })
        if (mobileBadgesRef.current) gsap.set(mobileBadgesRef.current, { opacity: 1 })
        if (mobileHeadlineRef.current) gsap.set(mobileHeadlineRef.current, { yPercent: 0, opacity: 1 })
        if (mobileItalicRef.current) gsap.set(mobileItalicRef.current, { yPercent: 0, opacity: 1 })
        if (mobileSubRef.current) gsap.set(mobileSubRef.current, { opacity: 1, y: 0 })
        if (mobileCtaRef.current) gsap.set(mobileCtaRef.current, { opacity: 1, y: 0 })
        if (mobileMetaRef.current) gsap.set(mobileMetaRef.current, { opacity: 1 })
      } else {
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
      return () => clearTimeout(watchdogTimer)
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // SCENARIO B: Mobile Cinematic Reveal (< 768px)
    // ─────────────────────────────────────────────────────────────────────────────
    if (isMobile) {
      const mobileCtx = gsap.context(() => {
        const slot = mobileCardSlotRef.current
        const card = mobileCardRef.current
        const cardImg = mobileCardImgRef.current
        const curtain = mobileCurtainRef.current
        const badges = mobileBadgesRef.current
        const headline = mobileHeadlineRef.current
        const italic = mobileItalicRef.current
        const sub = mobileSubRef.current
        const cta = mobileCtaRef.current
        const meta = mobileMetaRef.current

        if (!slot || !card || !cardImg) {
          clearTimeout(watchdogTimer)
          notifyComplete()
          return
        }

        const rect = slot.getBoundingClientRect()
        const vw = window.innerWidth
        const vh = window.innerHeight

        const targetW = rect.width > 50 ? rect.width : 340
        const targetH = rect.height > 50 ? rect.height : 420
        const targetLeft = rect.left || (vw - targetW) / 2
        const targetTop = rect.top || 96

        const scale = Math.max(vw / targetW, vh / targetH)
        const deltaX = vw / 2 - (targetLeft + targetW / 2)
        const deltaY = vh / 2 - (targetTop + targetH / 2)

        gsap.set(card, {
          x: deltaX,
          y: deltaY,
          scale: scale,
          borderRadius: 0,
          zIndex: 60,
          transformOrigin: '50% 50%',
        })

        gsap.set(cardImg, {
          scale: 1.35,
          transformOrigin: 'center 30%',
        })

        if (curtain) gsap.set(curtain, { opacity: 0.35 })
        if (badges) gsap.set(badges, { opacity: 0 })
        if (headline) gsap.set(headline, { yPercent: 120, opacity: 0 })
        if (italic) gsap.set(italic, { yPercent: 120, opacity: 0 })
        if (sub) gsap.set(sub, { opacity: 0, y: 15 })
        if (cta) gsap.set(cta, { opacity: 0, scale: 0.94, y: 10 })
        if (meta) gsap.set(meta, { opacity: 0 })

        const tl = gsap.timeline({
          onComplete: () => {
            clearTimeout(watchdogTimer)
            gsap.set(card, { clearProps: 'zIndex,transformOrigin' })
            notifyComplete()
          },
        })

        // Stage 1: Cinematic pause
        tl.to({}, { duration: 0.85 })

        // Stage 2: Dual Camera Pull-Back
        tl.to(
          card,
          {
            x: 0,
            y: 0,
            scale: 1,
            borderRadius: '32px',
            duration: 1.45,
            ease: 'expo.inOut',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.22)',
          },
          'zoom'
        )
        .to(
          cardImg,
          {
            scale: 1,
            duration: 1.45,
            ease: 'expo.inOut',
          },
          'zoom'
        )
        .to(
          curtain,
          {
            opacity: 0,
            duration: 1.1,
            ease: 'power2.out',
          },
          'zoom'
        )

        // Stage 3: Card Badges
        tl.to(
          badges,
          {
            opacity: 1,
            duration: 0.45,
            ease: 'power2.out',
          },
          '-=0.45'
        )

        // Stage 4: Typography Glide
        tl.to(
          [headline, italic],
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power4.out',
          },
          '-=0.35'
        )
        .to(
          sub,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
          },
          '-=0.55'
        )
        .to(
          cta,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            ease: 'back.out(1.5)',
          },
          '-=0.45'
        )

        if (meta) {
          tl.to(
            meta,
            {
              opacity: 1,
              duration: 0.4,
              ease: 'power2.out',
            },
            '-=0.3'
          )
        }
      }, containerRef)

      return () => {
        clearTimeout(watchdogTimer)
        mobileCtx.revert()
      }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // SCENARIO C: Desktop & Tablet Animation (>= 768px)
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
              clearTimeout(watchdogTimer)
              notifyComplete()
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
          })

          tl.to(
            heroBgRef.current,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1.4,
              ease: 'power3.out',
            },
            '-=0.4'
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

    return () => {
      clearTimeout(watchdogTimer)
      ctx.revert()
    }
  }, [animKey, notifyComplete])

  return (
    <section
      ref={containerRef}
      id="home-hero-section"
      className="w-full h-[100dvh] md:h-[75vh] md:min-h-[640px] md:max-h-[820px] lg:h-screen lg:max-h-none bg-white relative select-none flex flex-col items-center overflow-x-hidden"
    >
      {/* Top Floating Navigation */}
      <div className="w-full fixed top-0 left-0 right-0 z-[70] pointer-events-auto">
        <NavBar />
      </div>

      {/* Floating Replay Button for Testing */}
      <button
        type="button"
        onClick={handleReplayAnimation}
        className="fixed bottom-4 right-4 z-[999] px-3.5 py-2 rounded-full bg-black/90 hover:bg-black text-white text-[11px] font-mono tracking-wider shadow-2xl backdrop-blur-md border border-white/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <span>⟲</span>
        <span>Replay Hero Animation</span>
      </button>

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
          MOBILE VIEWPORT (< 768px): ZERO-SNAP UNIFIED ZOOM-OUT
          ========================================================================= */}
      <div className="md:hidden w-full h-[100dvh] flex flex-col justify-between items-center px-6 pt-24 pb-6 relative z-10 overflow-hidden">
        
        {/* Top: Card Plinth Slot */}
        <div
          ref={mobileCardSlotRef}
          className="w-full max-w-[340px] aspect-[3/3.75] shrink-0 relative flex items-center justify-center"
        >
          <div
            ref={mobileCardRef}
            className="w-full h-full relative rounded-[32px] overflow-hidden bg-neutral-900 will-change-transform [backface-visibility:hidden]"
          >
            {/* Portrait Image */}
            <img
              ref={mobileCardImgRef}
              src={DEFAULT_MOBILE_PORTRAIT}
              alt="Chembros Molecular Fragrance"
              className="w-full h-full object-cover object-[center_22%] pointer-events-none select-none will-change-transform [backface-visibility:hidden]"
              draggable={false}
            />

            {/* Atmosphere Mood Darkener */}
            <div
              ref={mobileCurtainRef}
              className="absolute inset-0 bg-black pointer-events-none"
            />

            {/* Overlay Vignette */}
            <div
              ref={mobileBadgesRef}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-[9px] font-mono tracking-[0.25em] text-white/90 uppercase pointer-events-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
                  ARCHIVE // 2026
                </span>
                <span>MADURAI · PARIS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Kinetic Typography */}
        <div className="w-full max-w-[340px] flex flex-col my-auto text-left space-y-2">
          
          <div className="overflow-hidden">
            <div className="text-[9px] font-mono tracking-[0.28em] uppercase text-black/50">
              4 SCENTS · INFINITE POSSIBILITIES
            </div>
          </div>

          <div className="overflow-hidden">
            <h1
              ref={mobileHeadlineRef}
              className="text-black text-[clamp(24px,6.8vw,30px)] font-normal font-['Conquera',sans-serif] leading-[1.04] uppercase tracking-wider will-change-transform"
            >
              Chemistry captured
            </h1>
          </div>

          <div className="overflow-hidden">
            <div
              ref={mobileItalicRef}
              className="text-[clamp(21px,5.8vw,26px)] font-light font-['FONTSPRING_DEMO_-_Pockota_Light','serif'] italic text-black/90 leading-[1.1] will-change-transform"
            >
              in a bottle.
            </div>
          </div>

          <p
            ref={mobileSubRef}
            className="text-black/65 text-xs font-thin font-['FONTSPRING_DEMO_-_Lufga_Thin','Poppins',sans-serif] leading-relaxed pt-1"
          >
            Where science meets scent. Explore our pure extrait molecular series.
          </p>

          <div ref={mobileCtaRef} className="pt-2">
            <Link
              to="/fragrances"
              className="w-full h-12 bg-black hover:bg-neutral-900 active:scale-[0.98] text-white rounded-full flex items-center justify-center font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-xs font-semibold tracking-[0.22em] uppercase shadow-[0_12px_24px_rgba(0,0,0,0.14)] transition-all duration-300"
            >
              Explore Collection
            </Link>
          </div>
        </div>

        {/* Bottom: Minimal Scroll Indicator */}
        <div
          ref={mobileMetaRef}
          className="w-full max-w-[340px] flex items-center justify-between text-[9px] font-mono tracking-[0.2em] text-black/40 uppercase pt-2 shrink-0"
        >
          <span>CHEMBROS © 2026</span>
          <span className="flex items-center gap-1 font-semibold text-black/70 animate-bounce">
            <span>SCROLL</span>
            <span>↓</span>
          </span>
        </div>

      </div>
    </section>
  )
}