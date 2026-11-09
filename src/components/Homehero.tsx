'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Volume2, VolumeX } from 'lucide-react'

// Assets
import angelWaterBg from '../assets/bg/bg123.webp'
import bottle1 from '../assets/product/t.webp'
import bottle2 from '../assets/product/x.webp'
import bottle3 from '../assets/product/r.webp'
import bottle4 from '../assets/product/j.webp'

const HERO_BG_SRC = (angelWaterBg as any)?.src || angelWaterBg
const MOBILE_VIDEO_DIRECT_SRC =
  'https://res.cloudinary.com/o2iumbkf/video/upload/q_auto,f_auto/video.mp4'

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
  const [isMuted, setIsMuted] = useState<boolean>(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const heroBgRef = useRef<HTMLImageElement>(null)
  const leftTextRef = useRef<HTMLDivElement>(null)
  const rightMetaRef = useRef<HTMLDivElement>(null)
  const bottleRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const mobileVideoRef = useRef<HTMLVideoElement>(null)

  const toggleMute = () => {
    if (!mobileVideoRef.current) return
    const nextMuted = !mobileVideoRef.current.muted
    mobileVideoRef.current.muted = nextMuted
    setIsMuted(nextMuted)
  }

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

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. ASYNC ASSET PRELOADER
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return

    const preloadLinks = [HERO_BG_SRC].map((src) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
      return link
    })

    return () => {
      preloadLinks.forEach((link) => link.remove())
    }
  }, [])

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const alreadyAnimated =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('chembros_hero_animated') === 'true'

    // Mobile has no GSAP animation — complete immediately
    if (isMobile) {
      notifyComplete()
      return
    }

    const watchdogTimer = setTimeout(() => {
      notifyComplete()
    }, 6000)

    // ─────────────────────────────────────────────────────────────────────────────
    // SCENARIO A: Already Animated in Session (Instant Layout on Desktop/Tablet)
    // ─────────────────────────────────────────────────────────────────────────────
    if (alreadyAnimated) {
      clearTimeout(watchdogTimer)
      notifyComplete()

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

      return () => clearTimeout(watchdogTimer)
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // SCENARIO B: Desktop & Tablet Animation (1.5s Hold on 4 Centered Bottles)
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
              scale: 0.88 + index * 0.04,
              zIndex: 160 + index,
              opacity: 0,
            })
          })

          tl.to(bottleRefs.current, {
            opacity: 1,
            duration: 0.9,
            stagger: 0.1,
            ease: 'power2.out',
          })

          tl.to({}, { duration: 1.5 })

          tl.to(
            heroBgRef.current,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1.5,
              ease: 'power3.out',
            },
            '-=0.3'
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
              idx === 0 ? '-=1.4' : '-=1.65'
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
      className="w-full min-h-[100dvh] h-auto md:h-[75vh] md:min-h-[640px] md:max-h-[820px] lg:h-screen lg:max-h-none bg-white relative select-none flex flex-col items-center"
    >
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
            src={HERO_BG_SRC}
            alt="Chembros Hero Graphic"
            fetchPriority="high"
            loading="eager"
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
                  fetchPriority="high"
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
            {/* Bold Montserrat with tight tracking */}
            <h1 className="text-black text-[clamp(22px,2.4vw,44px)] font-semibold font-['Montserrat',sans-serif] leading-[1.05] uppercase tracking-tight">
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
          MOBILE VIEWPORT (< 768px): ZOOMED EDGE-TO-EDGE VIDEO + SOUND TOGGLE
          ========================================================================= */}
      <div className="md:hidden w-full min-h-[100dvh] flex flex-col justify-between items-center px-5 pt-20 pb-8 relative z-20">
        
        {/* Top: Video Card Slot */}
        <div className="w-full max-w-[330px] h-[340px] max-h-[46vh] shrink-0 relative flex items-center justify-center mt-1">
          <div className="w-full h-full relative rounded-[28px] overflow-hidden bg-neutral-900 shadow-[0_20px_48px_-12px_rgba(0,0,0,0.22)]">
            <video
              ref={mobileVideoRef}
              src={MOBILE_VIDEO_DIRECT_SRC}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto"
              className="w-full h-full object-cover object-center scale-[1.03] pointer-events-none select-none"
            />

            {/* Mute / Unmute Button */}
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              className="absolute bottom-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-md"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Middle: Typography */}
        <div className="w-full max-w-[330px] flex flex-col text-left space-y-1.5 my-3">
          <div>
            <div className="text-[9px] font-mono tracking-[0.25em] uppercase text-black/50">
              4 SCENTS INFINITE POSSIBILITIES
            </div>
          </div>

          <div>
            <h1 className="text-black text-[clamp(21px,5.8vw,26px)] font-semibold font-['Montserrat',sans-serif] leading-[1.06] uppercase tracking-tight">
              Chemistry captured
            </h1>
          </div>

          <div>
            <div className="text-[clamp(19px,5.4vw,23px)] font-light font-['FONTSPRING_DEMO_-_Pockota_Light','serif'] italic text-black/90 leading-[1.08]">
              in a bottle.
            </div>
          </div>

          <p className="text-black/85 text-[11px] leading-relaxed pt-0.5">
            Where science meets scent. Explore our pure extrait molecular series.
          </p>

          <div className="pt-2">
            <Link
              to="/fragrances"
              className="w-full h-11 bg-black hover:bg-neutral-900 active:scale-[0.98] text-white rounded-full flex items-center justify-center font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-xs font-semibold tracking-[0.22em] uppercase shadow-[0_10px_20px_rgba(0,0,0,0.12)] transition-all duration-300"
            >
              Explore Collection
            </Link>
          </div>
        </div>

        {/* Bottom: Minimal Scroll Indicator */}
        <div className="w-full max-w-[330px] flex items-center justify-between text-[9px] font-mono tracking-[0.2em] text-black/40 uppercase pt-1 shrink-0">
          <span className="flex items-center gap-1 font-semibold text-black/70 animate-bounce">
            <span>SCROLL</span>
            <span>↓</span>
          </span>
        </div>

      </div>
    </section>
  )
}