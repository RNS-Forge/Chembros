import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import NavBar from './NavBar'

// Assets
import angelWaterBg from '../assets/bg/ogbg.png'
import bottle1 from '../assets/bg/1.png'
import bottle2 from '../assets/bg/2.png'
import bottle3 from '../assets/bg/3.png'
import bottle4 from '../assets/bg/4.png'

interface BottleConfig {
  id: string
  name: string
  img: string
  finalStyle: { left: string; top: string; width: string }
}

const BOTTLES: BottleConfig[] = [
  {
    id: 'molecule-x',
    name: 'MOLECULE X',
    img: bottle1,
    finalStyle: { left: '22.8%', top: '56.5%', width: '15.2%' },
  },
  {
    id: 'molecule-t',
    name: 'MOLECULE T',
    img: bottle2,
    finalStyle: { left: '37.8%', top: '49.0%', width: '17.6%' },
  },
  {
    id: 'molecule-j',
    name: 'MOLECULE J',
    img: bottle4,
    finalStyle: { left: '60.5%', top: '57.2%', width: '17.2%' },
  },
  {
    id: 'molecule-k',
    name: 'MOLECULE K',
    img: bottle3,
    finalStyle: { left: '77.8%', top: '65.5%', width: '15.2%' },
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

  useEffect(() => {
    // Mobile devices (<768px) bypass heavy sequence for instantaneous touch UX
    if (window.innerWidth < 768) {
      setLoadingFinished(true)
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => setLoadingFinished(true),
      })

      // 1. Initial Setup: Stack bottles in screen center, prep background & texts
      gsap.set(heroBgRef.current, { y: 90, scale: 1.05, opacity: 0 })
      gsap.set(leftTextRef.current, { y: 65, opacity: 0 })
      gsap.set(rightMetaRef.current, { y: 45, opacity: 0 })

      bottleRefs.current.forEach((el, index) => {
        if (!el) return
        gsap.set(el, {
          xPercent: -50,
          yPercent: -50,
          left: '50%',
          top: '50%',
          scale: 0.88 + index * 0.04,
          zIndex: 40 + index,
          opacity: 0,
        })
      })

      // 2. Initial Loader Entrance
      tl.to(bottleRefs.current, {
        opacity: 1,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power2.out',
      })
      .to(loaderTextRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.4')

      // 3. Requested 2-Second Hold Delay
      tl.to({}, { duration: 2.0 })

      // 4. Loader Fadeout
      tl.to(loaderTextRef.current, {
        opacity: 0,
        y: -15,
        duration: 0.5,
        ease: 'power2.in',
      })
      .to(loaderOverlayRef.current, {
        opacity: 0,
        duration: 1.3,
        ease: 'power3.inOut',
      }, '-=0.2')

      // 5. Parallax Reveal: Background rises smoothly from the bottom
      tl.to(heroBgRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 2.0,
        ease: 'power3.out',
      }, '-=1.2')

      // 6. Smooth Bottle Dispersion: Fly from center directly to rock plinths
      BOTTLES.forEach((bottle, idx) => {
        const el = bottleRefs.current[idx]
        if (!el) return

        tl.to(
          el,
          {
            xPercent: 0,
            yPercent: 0,
            left: bottle.finalStyle.left,
            top: bottle.finalStyle.top,
            scale: 1,
            duration: 2.0,
            ease: 'power4.out',
          },
          idx === 0 ? '-=1.8' : '-=1.92' // Gentle overlapping stagger
        )
      })

      // 7. Parallax Reveal: Left Title & Right Metadata rise at distinct speeds
      tl.to(
        leftTextRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 1.4,
          ease: 'power3.out',
        },
        '-=1.4'
      )
      .to(
        rightMetaRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 1.4,
          ease: 'power3.out',
        },
        '-=1.2'
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="w-full h-screen min-h-[640px] max-h-[1080px] bg-white relative overflow-hidden select-none flex items-center justify-center"
    >
      <NavBar />

      {/* =========================================================================
          FULL-SCREEN WHITE LOADER OVERLAY
          ========================================================================= */}
      {!loadingFinished && (
        <div
          ref={loaderOverlayRef}
          className="fixed inset-0 w-screen h-screen bg-white z-[150] pointer-events-none flex flex-col items-center justify-between py-12"
        >
          {/* Brand Monograph Header */}
          <div className="text-[11px] font-mono tracking-[0.3em] uppercase text-black/40">
            CHEM BROS // MOLECULAR SYNTHESIS
          </div>

          {/* Center Laboratory Telemetry Status */}
          <div
            ref={loaderTextRef}
            className="opacity-0 translate-y-3 flex flex-col items-center gap-2.5 mb-16 text-center"
          >
            <div className="flex items-center gap-2 text-xs font-mono tracking-[0.25em] uppercase text-black">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>ALIGNING MOLECULAR FORMULAS</span>
            </div>
            <span className="text-[10px] font-mono text-black/40 tracking-widest uppercase">
              2.0S EQUILIBRIUM // STABILIZING
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          DESKTOP & TABLET VIEWPORT (Parallax Composite)
          ========================================================================= */}
      <div className="hidden md:flex w-full h-full relative items-center justify-center overflow-hidden">
        
        {/* Full-width composite stage */}
        <div className="relative w-full h-full max-h-screen flex items-center justify-center overflow-hidden">
          
          {/* Centered Graphic Canvas */}
          <div className="relative w-full max-w-[1920px] aspect-[1920/1069] flex items-center justify-center">
            
            {/* Background Graphic: Slides up from bottom */}
            <img
              ref={heroBgRef}
              className="w-full h-full object-contain select-none pointer-events-none absolute inset-0 z-0 will-change-transform"
              src={angelWaterBg}
              alt="Blue-Winged Angel in Crystal Waters"
              draggable={false}
            />

            {/* The 4 Bottles (Animated by GSAP with void-returning ref callbacks) */}
            <div className={`absolute inset-0 w-full h-full pointer-events-none ${loadingFinished ? 'z-20' : 'z-[160]'}`}>
              {BOTTLES.map((bottle, idx) => (
                <Link
                  key={bottle.id}
                  to={`/fragrances/${bottle.id}`}
                  ref={(el) => {
                    bottleRefs.current[idx] = el
                  }}
                  style={{ width: bottle.finalStyle.width }}
                  className="absolute block group cursor-pointer aspect-[1/1.05] will-change-transform pointer-events-auto"
                >
                  {/* Hover Backlight */}
                  <div className="absolute inset-0 bg-blue-400/25 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <img
                    className="w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_14px_28px_rgba(0,0,0,0.35)] group-hover:scale-105 group-hover:-translate-y-1.5 transition-all duration-500 ease-out"
                    src={bottle.img}
                    alt={bottle.name}
                    draggable={false}
                  />
                </Link>
              ))}
            </div>

            {/* Left-Side Typography: Parallax upward drift */}
            <div
              ref={leftTextRef}
              className="absolute left-[4%] lg:left-[6%] top-[25%] lg:top-[27%] z-30 flex flex-col items-start max-w-[34%] pointer-events-auto will-change-transform"
            >
              <h1 className="text-black text-[clamp(22px,2.4vw,44px)] font-normal font-['Conquera',sans-serif] leading-[1.08] uppercase tracking-wider">
                Chemistry captured
              </h1>
              <div className="text-black text-[clamp(20px,2.2vw,42px)] font-light font-['FONTSPRING_DEMO_-_Pockota_Light','serif'] leading-[1.15] italic mt-0.5">
                in a bottle.
              </div>
              <p className="text-black/75 text-[clamp(11px,0.95vw,16px)] font-thin font-['FONTSPRING_DEMO_-_Lufga_Thin','Poppins',sans-serif] leading-relaxed tracking-wide mt-2 max-w-[340px]">
                Where science meets scent. Explore our molecular series.
              </p>

              <Link
                to="/fragrances"
                className="mt-4 px-6 lg:px-8 py-2.5 lg:py-3.5 bg-black hover:bg-neutral-800 active:scale-95 text-white text-[clamp(11px,0.85vw,15px)] font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-wider uppercase rounded-full shadow-lg transition-all duration-300 group"
              >
                <span className="group-hover:scale-105 inline-block transition-transform duration-300">
                  Explore collection
                </span>
              </Link>
            </div>

            {/* Right-Side Metadata: Parallax secondary drift */}
            <div
              ref={rightMetaRef}
              className="absolute right-[4%] lg:right-[6%] top-[26%] lg:top-[28%] z-30 flex flex-col items-end text-right pointer-events-none will-change-transform"
            >
              <div className="inline-flex items-center gap-1.5 text-black/80 font-mono text-[clamp(9px,0.7vw,12px)] tracking-[0.25em] uppercase mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>04 SCENTS // INFINITE POSSIBILITIES</span>
              </div>
              <div className="text-[clamp(8px,0.6vw,11px)] font-mono tracking-widest text-black/50 uppercase">
                PURE EXTRAIT ARCHIVE · 28%–35% DENSITY
              </div>
              <div className="text-[clamp(7px,0.55vw,10px)] font-mono tracking-widest text-black/40 uppercase mt-0.5">
                MADURAI [9.9252° N, 78.1198° E]
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* =========================================================================
          MOBILE VIEWPORT (<768px)
          ========================================================================= */}
      <div className="md:hidden flex flex-col w-full pt-20 pb-10 px-5 relative z-10 overflow-y-auto">
        
        {/* Mobile Statue Banner */}
        <div className="w-full h-[260px] relative rounded-[28px] overflow-hidden shadow-lg border border-black/5 mb-5">
          <img
            className="w-full h-full object-cover object-[center_30%]"
            src={angelWaterBg}
            alt="Blue-Winged Angel in Crystal Waters"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end text-[9px] font-mono tracking-widest text-white/80 uppercase">
            <span>ARCHIVE // 2026</span>
            <span>MADURAI · PARIS</span>
          </div>
        </div>

        {/* Minimal Alpha Tag */}
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-black/60 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span>04 SCENTS // INFINITE POSSIBILITIES</span>
        </div>

        {/* Headline */}
        <div className="flex flex-col mb-4">
          <h1 className="text-black text-2xl font-normal font-['Conquera',sans-serif] leading-tight uppercase tracking-wider">
            Chemistry captured
          </h1>
          <span className="text-xl font-light font-['FONTSPRING_DEMO_-_Pockota_Light','serif'] italic text-black/90">
            in a bottle.
          </span>
          <p className="text-black/70 text-xs font-thin font-['FONTSPRING_DEMO_-_Lufga_Thin','Poppins',sans-serif] leading-relaxed mt-1.5">
            Where science meets scent. Explore our molecular series.
          </p>
        </div>

        {/* CTA Button */}
        <Link
          to="/fragrances"
          className="w-full h-12 bg-black active:scale-95 text-white rounded-2xl flex items-center justify-center font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-sm uppercase tracking-wider shadow-md transition-all mb-6"
        >
          Explore collection
        </Link>

        {/* Mobile Swipeable Gallery */}
        <div className="w-full">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-black/50 uppercase mb-3">
            <span>THE 4 FORMULAS</span>
            <span>SWIPE →</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
            {BOTTLES.map((bottle) => (
              <Link
                key={bottle.id}
                to={`/fragrances/${bottle.id}`}
                className="w-48 shrink-0 bg-[#F7F9FA] rounded-[22px] p-4 flex flex-col items-center snap-center border border-black/5"
              >
                <img
                  src={bottle.img}
                  alt={bottle.name}
                  className="w-28 h-28 object-contain drop-shadow-md my-2"
                />
                <span className="text-xs font-normal font-['Conquera',sans-serif] tracking-wider text-black uppercase mt-1">
                  {bottle.name}
                </span>
                <span className="text-[10px] font-mono text-black/40 uppercase mt-0.5">
                  30ML EXTRAIT
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}