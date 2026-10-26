import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import NavBar from './NavBar'

// Assets
import angelWaterBg from '../assets/hero.png'
import bottle1 from '../assets/bg/1.png'
import bottle2 from '../assets/bg/2.png'
import bottle3 from '../assets/bg/3.png'
import bottle4 from '../assets/bg/4.png'

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
    img: bottle1,
    desktop: { left: '8.5%', top: '58%' },
    tablet1024: { left: '8.5%', top: '53%' },
  },
  {
    id: 'molecule-t',
    name: 'MOLECULE T',
    img: bottle2,
    desktop: { left: '32.5%', top: '64%' },
    tablet1024: { left: '32.5%', top: '59%' },
  },
  {
    id: 'molecule-j',
    name: 'MOLECULE J',
    img: bottle4,
    desktop: { left: '56.5%', top: '64%' },
    tablet1024: { left: '56.5%', top: '59%' },
  },
  {
    id: 'molecule-k',
    name: 'MOLECULE K',
    img: bottle3,
    desktop: { left: '80.5%', top: '58%' },
    tablet1024: { left: '80.5%', top: '53%' },
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
    if (window.innerWidth < 768) {
      setLoadingFinished(true)
      return
    }

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
            onComplete: () => setLoadingFinished(true),
          })

          // 1. Initial State
          gsap.set(heroBgRef.current, { y: 50, scale: 1.03, opacity: 0 })
          gsap.set(leftTextRef.current, { y: 45, opacity: 0 })
          gsap.set(rightMetaRef.current, { y: 35, opacity: 0 })

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

          // 2. Entrance
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

          // 3. 2-Second Hold
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
              duration: 1.2,
              ease: 'power3.inOut',
            }, '-=0.2')

          // 5. Hero Background Reveal
          tl.to(heroBgRef.current, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.8,
            ease: 'power3.out',
          }, '-=1.1')

          // 6. Direct Dispersion
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
                duration: 1.9,
                ease: 'power4.out',
              },
              idx === 0 ? '-=1.6' : '-=1.75'
            )
          })

          // 7. Typography
          tl.to(
            leftTextRef.current,
            {
              y: 0,
              opacity: 1,
              duration: 1.2,
              ease: 'power3.out',
            },
            '-=1.3'
          )
            .to(
              rightMetaRef.current,
              {
                y: 0,
                opacity: 1,
                duration: 1.2,
                ease: 'power3.out',
              },
              '-=1.1'
            )
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="w-full h-screen h-[100dvh] min-h-[600px] bg-white relative overflow-hidden select-none flex items-start justify-center"
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
          DESKTOP, LAPTOP & TABLET VIEWPORT (Zero Top Gap)
          ========================================================================= */}
      <div className="hidden md:flex w-full h-full relative items-start justify-center overflow-hidden">

        <div className="relative w-full h-full max-w-[1920px] flex items-start justify-center overflow-hidden">

          {/* Background Graphic: object-top eliminates the top white gap on 1024px screens */}
          <img
            ref={heroBgRef}
            className="w-full h-full object-cover md:object-contain object-top md:object-[center_top] select-none pointer-events-none absolute inset-0 z-0 will-change-transform"
            src={angelWaterBg}
            alt="Chembros Hero Graphic"
            draggable={false}
          />

          {/* The 4 Bottles */}
          <div className={`absolute inset-0 w-full h-full pointer-events-none ${loadingFinished ? 'z-20' : 'z-[160]'}`}>
            {BOTTLES.map((bottle, idx) => (
              <Link
                key={bottle.id}
                to={`/fragrances/${bottle.id}`}
                ref={(el) => {
                  bottleRefs.current[idx] = el
                }}
                style={{ width: 'clamp(160px, 15.5vw, 260px)' }}
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

          {/* Left-Side Editorial Typography */}
          <div
            ref={leftTextRef}
            className="absolute left-4 sm:left-6 md:left-8 lg:left-[clamp(32px,8.95vw,172px)] top-[20%] lg:top-[25%] z-30 flex flex-col items-start max-w-[42%] lg:max-w-[34%] pointer-events-auto will-change-transform"
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

          {/* Right-Side Metadata */}
          <div
            ref={rightMetaRef}
            className="absolute right-[4%] lg:right-[5%] top-[22%] lg:top-[26%] z-30 flex flex-col items-end text-right pointer-events-none will-change-transform"
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
          MOBILE VIEWPORT (<768px)
          ========================================================================= */}
      <div className="md:hidden flex flex-col w-full h-full pt-20 pb-8 px-5 relative z-10 overflow-y-auto justify-between">
        <div className="w-full h-[260px] relative rounded-[28px] overflow-hidden shadow-lg border border-black/5 shrink-0 mb-4">
          <img
            className="w-full h-full object-cover object-[center_15%]"
            src={angelWaterBg}
            alt="Chembros Hero Graphic"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end text-[9px] font-mono tracking-widest text-white/80 uppercase">
            <span>ARCHIVE // 2026</span>
            <span>MADURAI · PARIS</span>
          </div>
        </div>

        <div className="flex flex-col mb-4">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-black/60 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>04 SCENTS // INFINITE POSSIBILITIES</span>
          </div>
          <h1 className="text-black text-2xl font-normal font-['Conquera',sans-serif] leading-tight uppercase tracking-wider">
            Chemistry captured
          </h1>
          <span className="text-xl font-light font-['FONTSPRING_DEMO_-_Pockota_Light','serif'] italic text-black/90">
            in a bottle.
          </span>
          <p className="text-black/70 text-xs font-thin font-['FONTSPRING_DEMO_-_Lufga_Thin','Poppins',sans-serif] leading-relaxed mt-1">
            Where science meets scent. Explore our molecular series.
          </p>

          <Link
            to="/fragrances"
            className="w-full h-11 bg-black active:scale-95 text-white rounded-2xl flex items-center justify-center font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-xs uppercase tracking-wider shadow-md transition-all mt-3"
          >
            Explore collection
          </Link>
        </div>

        <div className="w-full shrink-0">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-black/50 uppercase mb-2">
            <span>THE 4 FORMULAS</span>
            <span>SWIPE →</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {BOTTLES.map((bottle) => (
              <Link
                key={bottle.id}
                to={`/fragrances/${bottle.id}`}
                className="w-44 shrink-0 bg-[#F7F9FA] rounded-[22px] p-3 flex flex-col items-center snap-center border border-black/5"
              >
                <img
                  src={bottle.img}
                  alt={bottle.name}
                  className="w-24 h-24 object-contain drop-shadow-md my-1"
                />
                <span className="text-xs font-normal font-['Conquera',sans-serif] tracking-wider text-black uppercase mt-1">
                  {bottle.name}
                </span>
                <span className="text-[9px] font-mono text-black/40 uppercase mt-0.5">
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