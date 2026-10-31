'use client'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCart } from '../context/CartContext'
import { getProductsApi } from '../services/api'
import type { Product } from '../types'

import boyImg from '../assets/tonedboy.png'
import bottle1Raw from '../assets/bg/1.png'
import bottle2Raw from '../assets/bg/2.png'
import bottle3Raw from '../assets/bg/4.png' // Molecule J (hero flight target)
import bottle4Raw from '../assets/bg/3.png'
import DiscoveryRaw from '../assets/product/discovery.png'

const boySrc = (boyImg as any)?.src || boyImg
const bottle1Src = (bottle1Raw as any)?.src || bottle1Raw
const bottle2Src = (bottle2Raw as any)?.src || bottle2Raw
const bottle3Src = (bottle3Raw as any)?.src || bottle3Raw
const bottle4Src = (bottle4Raw as any)?.src || bottle4Raw
const discoverySrc = (DiscoveryRaw as any)?.src || DiscoveryRaw

gsap.registerPlugin(ScrollTrigger)

export default function HomeProduct() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { addToCart } = useCart()
  const [moleculeProducts, setMoleculeProducts] = useState<Product[]>([])
  const [discoveryArchive, setDiscoveryArchive] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch only dynamic products from live database
  useEffect(() => {
    let isMounted = true
    async function loadProducts() {
      try {
        const liveProducts = await getProductsApi()
        if (!isMounted || !Array.isArray(liveProducts)) return

        const molecules = liveProducts.filter((p) => !p.is_archive)
        const archive = liveProducts.find(
          (p) =>
            p.is_archive ||
            p.slug === 'the-discovery-archive' ||
            p.name.toLowerCase().includes('discovery')
        )

        if (molecules.length > 0) {
          const orderMap: Record<string, number> = {
            'molecule-j': 0,
            'molecule-x': 1,
            'molecule-t': 2,
            'molecule-k': 3,
          }
          const sortedMolecules = [...molecules].sort((a, b) => {
            const posA = a.slug ? (orderMap[a.slug.toLowerCase()] ?? 99) : 99
            const posB = b.slug ? (orderMap[b.slug.toLowerCase()] ?? 99) : 99
            return posA - posB
          })
          setMoleculeProducts(sortedMolecules.slice(0, 4))
        }

        if (archive) {
          setDiscoveryArchive(archive)
        }
      } catch (err) {
        console.error('Failed to load products from database:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadProducts()
    return () => {
      isMounted = false
    }
  }, [])

  // Resolve dynamic bottle image
  const getProductImage = (prod: Product, idx: number) => {
    if (idx === 0) return bottle3Src
    if (prod.slug === 'molecule-x') return bottle1Src
    if (prod.slug === 'molecule-t') return bottle2Src
    if (prod.slug === 'molecule-k') return bottle4Src
    const list = [bottle3Src, bottle1Src, bottle2Src, bottle4Src]
    return prod.image_base64 || list[idx % list.length]
  }

  // 100% Symmetrical, Bidirectional Scroll Flight Animation
  useEffect(() => {
    if (window.innerWidth < 768) return

    let flightTimeline: gsap.core.Timeline | null = null
    let flightClone: HTMLDivElement | null = null

    const createFlight = () => {
      const heroBottle = document.getElementById('hero-scroll-bottle-3')
      const targetSlot = document.getElementById('target-product-slot-1')

      if (!heroBottle || !targetSlot) return

      // Clean up previous proxy
      const existing = document.getElementById('gsap-floating-flight-bottle')
      if (existing) existing.remove()
      if (flightTimeline) flightTimeline.kill()

      // Fixed viewport coordinate translation avoids page scroll math errors completely
      flightClone = document.createElement('div')
      flightClone.id = 'gsap-floating-flight-bottle'
      flightClone.style.position = 'fixed'
      flightClone.style.top = '0px'
      flightClone.style.left = '0px'
      flightClone.style.zIndex = '9999'
      flightClone.style.pointerEvents = 'none'
      flightClone.style.willChange = 'transform, opacity'
      flightClone.style.opacity = '0'

      const img = document.createElement('img')
      img.src = bottle3Src
      img.style.width = '100%'
      img.style.height = '100%'
      img.style.objectFit = 'contain'
      img.style.filter = 'drop-shadow(0 18px 32px rgba(0,0,0,0.22))'
      flightClone.appendChild(img)

      document.body.appendChild(flightClone)

      // Dedicated single-timeline ScrollTrigger with symmetrical interpolation
      flightTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#home-hero-section',
          start: 'top top',
          endTrigger: sectionRef.current,
          end: 'top 25%',
          scrub: true, // Direct 1:1 scrub binds forward and backward scroll to identical frames
          onUpdate: (self) => {
            const p = self.progress

            if (p <= 0.015) {
              // At hero rest
              gsap.set(flightClone, { opacity: 0 })
              gsap.set(heroBottle, { opacity: 1 })
              gsap.set(targetSlot, { opacity: 0 })
              return
            }

            if (p >= 0.985) {
              // At Card 1 rest
              gsap.set(flightClone, { opacity: 0 })
              gsap.set(heroBottle, { opacity: 0 })
              gsap.set(targetSlot, { opacity: 1 })
              return
            }

            // In-flight
            gsap.set(flightClone, { opacity: 1 })
            gsap.set(heroBottle, { opacity: 0 })
            gsap.set(targetSlot, { opacity: 0 })

            // Get live viewport bounding boxes
            const heroRect = heroBottle.getBoundingClientRect()
            const targetRect = targetSlot.getBoundingClientRect()

            // Calculate instantaneous positions
            const x = heroRect.left + (targetRect.left - heroRect.left) * p
            const y = heroRect.top + (targetRect.top - heroRect.top) * p
            const width = heroRect.width + (targetRect.width - heroRect.width) * p
            const height = heroRect.height + (targetRect.height - heroRect.height) * p

            // Sine curve for smooth aerodynamic tilt: 0Â° -> -7Â° -> 0Â°
            const rotation = Math.sin(p * Math.PI) * -7

            gsap.set(flightClone, {
              x,
              y,
              width,
              height,
              rotation,
              transformOrigin: '50% 50%',
            })
          },
        },
      })
    }

    window.addEventListener('hero-animation-complete', createFlight)
    window.addEventListener('reinit-flight-bottle', createFlight)
    const timer = setTimeout(createFlight, 2200)

    const handleResize = () => {
      ScrollTrigger.refresh()
      createFlight()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('hero-animation-complete', createFlight)
      window.removeEventListener('reinit-flight-bottle', createFlight)
      window.removeEventListener('resize', handleResize)
      clearTimeout(timer)
      if (flightTimeline) flightTimeline.kill()
      if (flightClone) flightClone.remove()
    }
  }, [])

  // Once database products are rendered, refresh ScrollTrigger and initialize flight bottle
  useEffect(() => {
    if (moleculeProducts.length > 0) {
      const t = setTimeout(() => {
        ScrollTrigger.refresh()
        window.dispatchEvent(new CustomEvent('reinit-flight-bottle'))
      }, 100)
      return () => clearTimeout(t)
    }
  }, [moleculeProducts])

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white relative overflow-hidden select-none py-10 md:py-14 lg:py-18 xl:py-24 px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex justify-center"
    >
      <div className="w-full max-w-[1583px] flex flex-col items-center gap-10 sm:gap-14 lg:gap-16 xl:gap-20 relative z-10">
        
        {/* =========================================================================
            PART 1: FOUR FORMULAS
            ========================================================================= */}
        <div className="w-full flex flex-col items-center gap-6 sm:gap-8 lg:gap-9 relative z-10">
          <h2 className="text-center text-black text-[clamp(22px,2.4vw,46px)] font-normal font-['Conquera',sans-serif] leading-tight tracking-wider uppercase">
            FOUR FORMULAS
          </h2>

          {loading && moleculeProducts.length === 0 ? (
            <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-4 xl:gap-6 2xl:gap-8 justify-items-center">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="w-full max-w-[310px] lg:max-w-[270px] xl:max-w-[340px] 2xl:max-w-[380px] h-[320px] sm:h-[460px] lg:h-[470px] xl:h-[540px] 2xl:h-[587px] relative bg-black/90 rounded-[20px] sm:rounded-[34px] lg:rounded-[36px] xl:rounded-[44px] 2xl:rounded-[50px] overflow-hidden p-3 sm:p-6 flex flex-col justify-between items-center animate-pulse"
                >
                  <div className="w-16 sm:w-28 h-3 sm:h-4 bg-white/10 rounded-full" />
                  <div className="w-14 sm:w-20 h-28 sm:h-44 bg-white/5 rounded-xl sm:rounded-2xl" />
                  <div className="w-full flex flex-col items-center gap-2 sm:gap-3">
                    <div className="w-12 sm:w-16 h-3 sm:h-5 bg-white/10 rounded" />
                    <div className="w-full max-w-[120px] sm:max-w-[200px] h-7 sm:h-10 bg-white/10 rounded-xl sm:rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-4 xl:gap-6 2xl:gap-8 justify-items-center">
              {moleculeProducts.map((prod, idx) => (
                <div
                  key={prod.id}
                  className="w-full max-w-[310px] lg:max-w-[270px] xl:max-w-[340px] 2xl:max-w-[380px] h-[330px] sm:h-[460px] lg:h-[470px] xl:h-[540px] 2xl:h-[587px] relative bg-black rounded-[20px] sm:rounded-[34px] lg:rounded-[36px] xl:rounded-[44px] 2xl:rounded-[50px] overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.18)] group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_42px_rgba(0,0,0,0.28)] flex flex-col justify-between items-center p-3 sm:p-5 lg:p-5 xl:p-7 2xl:p-8"
                >
                  {/* Title */}
                  <Link
                    to={`/fragrances/${prod.slug || prod.id}`}
                    className="w-full text-center text-white text-[10px] sm:text-sm lg:text-[13px] xl:text-base 2xl:text-xl font-normal font-['Conquera',sans-serif] tracking-wider sm:tracking-widest uppercase pt-0.5 sm:pt-1 hover:opacity-80 transition-opacity cursor-pointer truncate px-1"
                  >
                    {prod.name}
                  </Link>

                  {/* Bottle Presentation Slot */}
                  <Link
                    to={`/fragrances/${prod.slug || prod.id}`}
                    className="my-auto flex items-center justify-center relative w-full h-[140px] sm:h-[200px] lg:h-[210px] xl:h-[250px] 2xl:h-[280px] cursor-pointer"
                  >
                    <img
                      id={idx === 0 ? 'target-product-slot-1' : undefined}
                      className="w-auto h-full max-h-[130px] sm:max-h-[190px] lg:max-h-[195px] xl:max-h-[235px] 2xl:max-h-[265px] object-contain drop-shadow-[0_10px_22px_rgba(255,255,255,0.06)] group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
                      src={getProductImage(prod, idx)}
                      alt={`${prod.name} Bottle`}
                      draggable={false}
                    />
                  </Link>

                  {/* Price & CTA */}
                  <div className="w-full flex flex-col items-center gap-1.5 sm:gap-2.5 lg:gap-2 xl:gap-3 pb-0.5 sm:pb-1">
                    <div className="text-white text-xs sm:text-base md:text-lg lg:text-base xl:text-xl 2xl:text-2xl font-normal font-['Conquera',sans-serif] tracking-wider">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart(prod)}
                      className="w-full max-w-[130px] sm:max-w-[210px] lg:max-w-[200px] xl:max-w-[250px] 2xl:max-w-[280px] h-7 sm:h-9 md:h-10 lg:h-9 xl:h-12 2xl:h-14 bg-neutral-600/40 hover:bg-neutral-600/60 active:scale-95 rounded-xl sm:rounded-2xl xl:rounded-3xl overflow-hidden border border-white/10 backdrop-blur-md transition-all duration-300 flex items-center justify-center cursor-pointer group/btn shadow-sm"
                      aria-label={`Add ${prod.name} to Cart`}
                    >
                      <span className="text-white text-[9px] sm:text-[11px] md:text-xs lg:text-[11px] xl:text-sm 2xl:text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-wide transition-transform group-hover/btn:scale-105">
                        Add to cart
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================================
            PART 2: THE DISCOVERY ARCHIVE COMPOSITE
            ========================================================================= */}
        <div className="w-full relative flex flex-col items-center pt-12 sm:pt-16 lg:pt-20 xl:pt-24">
          <div className="w-[88%] sm:w-[74%] md:w-[65%] lg:w-[940px] xl:w-[1080px] max-w-[1080px] absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-0 flex items-end justify-center">
            <img
              className="w-full h-auto max-h-[600px] lg:max-h-[660px] xl:max-h-[820px] object-contain object-bottom select-none pointer-events-none"
              src={boySrc}
              alt="Chembros Model Graphic"
              draggable={false}
            />
          </div>

          {discoveryArchive ? (
            <div
              className="w-full min-h-[440px] lg:h-[510px] xl:h-[640px] 2xl:h-[710px] rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] xl:rounded-[48px] p-5 sm:p-7 lg:p-8 xl:p-12 2xl:p-14 relative z-10 pointer-events-auto overflow-hidden flex items-center shadow-[0_15px_35px_rgba(0,0,0,0.12),_inset_0_1px_1px_rgba(255,255,255,0.6)]"
              style={{
                background:
                  'linear-gradient(227deg, rgba(0, 0, 0, 0.35) 6%, rgba(255, 255, 255, 0.25) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center">
                <Link
                  to={`/fragrances/${discoveryArchive.slug || discoveryArchive.id}`}
                  className="lg:col-span-6 w-full h-[260px] sm:h-[320px] lg:h-[380px] xl:h-[460px] 2xl:h-[510px] bg-white rounded-[20px] sm:rounded-[24px] lg:rounded-[26px] xl:rounded-[30px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.06)] group cursor-pointer block"
                >
                  <img
                    className="w-full h-full object-cover object-center select-none pointer-events-none group-hover:scale-105 transition-transform duration-700 ease-out"
                    src={discoverySrc}
                    alt={discoveryArchive.name}
                    draggable={false}
                  />
                </Link>

                <div className="lg:col-span-6 flex flex-col justify-center space-y-3 lg:space-y-3 xl:space-y-5">
                  <Link
                    to={`/fragrances/${discoveryArchive.slug || discoveryArchive.id}`}
                    className="text-white text-xl sm:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-normal font-['Conquera',sans-serif] leading-tight tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] hover:opacity-90 transition-opacity cursor-pointer block"
                  >
                    {discoveryArchive.name.toUpperCase().includes('DISCOVERY') ? (
                      <>
                        THE DISCOVERY <br />
                        ARCHIVE
                      </>
                    ) : (
                      discoveryArchive.name
                    )}
                  </Link>

                  <p className="text-white text-xs sm:text-sm lg:text-xs xl:text-sm 2xl:text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-normal tracking-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                    {discoveryArchive.subtitle || 'The complete Molecule Series, in miniature.'}
                  </p>

                  <div className="text-white/90 text-[11px] sm:text-xs lg:text-[11px] xl:text-sm 2xl:text-base font-normal font-['General_Sans','Poppins',sans-serif] leading-relaxed tracking-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                    {discoveryArchive.volume_ml ? `${Math.round(discoveryArchive.volume_ml / 3)} × 3ml Extrait` : '4 × 3ml Extrait'}<br />
                    {discoveryArchive.category || 'Extrait de Parfum'}<br />
                    {discoveryArchive.concentration || '25% natural oil concentration'}<br />
                    {discoveryArchive.gender || 'Unisex'} · {discoveryArchive.longevity || '8+ hours'}
                  </div>

                  <div className="pt-1.5 lg:pt-1 xl:pt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 xl:gap-6">
                    <div className="text-white text-xl sm:text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl font-normal font-['Conquera',sans-serif] tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                      ₹{discoveryArchive.price.toLocaleString('en-IN')}
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart(discoveryArchive)}
                      className="w-full sm:w-44 lg:w-40 xl:w-52 2xl:w-56 h-10 lg:h-9 xl:h-12 2xl:h-14 bg-white/85 hover:bg-white active:scale-95 rounded-2xl xl:rounded-3xl overflow-hidden transition-all duration-300 shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_24px_rgba(255,255,255,0.4)] flex items-center justify-center cursor-pointer group/btn"
                      aria-label={`Add ${discoveryArchive.name} to Cart`}
                    >
                      <span className="text-black text-xs lg:text-xs xl:text-sm 2xl:text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-wide transition-transform group-hover/btn:scale-105">
                        Add to cart
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full min-h-[440px] lg:h-[510px] xl:h-[640px] rounded-[28px] sm:rounded-[36px] bg-neutral-900/40 backdrop-blur-md animate-pulse flex items-center justify-center">
              <div className="w-48 h-6 bg-white/10 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}