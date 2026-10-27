import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import boyImg from '../assets/tonedboy.png'
import bottleImg from '../assets/bg/1.png'
import bottle3Img from '../assets/bg/4.png' // Molecule J (Hero bottle 3)
import Discovery from '../assets/product/discovery.png'

gsap.registerPlugin(ScrollTrigger)

interface ProductCardItem {
  id: number
  title: string
  price: string
}

const PRODUCTS: ProductCardItem[] = [
  { id: 1, title: 'Molecule J', price: '₹1299' },
  { id: 2, title: 'Molecule X', price: '₹1299' },
  { id: 3, title: 'Molecule T', price: '₹1299' },
  { id: 4, title: 'Molecule K', price: '₹1299' },
]

export default function HomeProduct() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.innerWidth < 768) return

    let scrollTween: gsap.core.Timeline | null = null
    let flightClone: HTMLDivElement | null = null

    const initFlightAnimation = () => {
      const heroBottle = document.getElementById('hero-scroll-bottle-3')
      const targetSlot = document.getElementById('target-product-slot-1')

      if (!heroBottle || !targetSlot) return

      // Clean up previous instances if any
      const existingClone = document.getElementById('gsap-floating-flight-bottle')
      if (existingClone) existingClone.remove()

      // Create high-z-index flight vessel in absolute document space
      flightClone = document.createElement('div')
      flightClone.id = 'gsap-floating-flight-bottle'
      flightClone.style.position = 'absolute'
      flightClone.style.zIndex = '9999'
      flightClone.style.pointerEvents = 'none'
      flightClone.style.willChange = 'transform'

      const img = document.createElement('img')
      img.src = bottle3Img
      img.style.width = '100%'
      img.style.height = '100%'
      img.style.objectFit = 'contain'
      img.style.filter = 'drop-shadow(0 20px 35px rgba(0,0,0,0.28))'
      flightClone.appendChild(img)

      document.body.appendChild(flightClone)

      // Calculate initial placement in page coordinates
      const startRect = heroBottle.getBoundingClientRect()
      const scrollY = window.scrollY || window.pageYOffset

      gsap.set(flightClone, {
        left: startRect.left,
        top: startRect.top + scrollY,
        width: startRect.width,
        height: startRect.height,
        opacity: 0,
        x: 0,
        y: 0,
        rotation: 0,
        transformOrigin: '50% 50%',
      })

      // The scrubbed flight timeline
      scrollTween = gsap.timeline({
        scrollTrigger: {
          trigger: '#home-hero-section',
          start: 'top top',
          endTrigger: sectionRef.current,
          end: 'top 20%',
          scrub: 1.4, // Smooth inertial scrub
          onUpdate: (self) => {
            // When in flight, show the clone and hide endpoints
            if (self.progress > 0.01 && self.progress < 0.99) {
              gsap.set(flightClone, { opacity: 1 })
              gsap.set(heroBottle, { opacity: 0 })
              gsap.set(targetSlot, { opacity: 0 })
            } else if (self.progress <= 0.01) {
              // At the very top (Hero idle)
              gsap.set(flightClone, { opacity: 0 })
              gsap.set(heroBottle, { opacity: 1 })
              gsap.set(targetSlot, { opacity: 0 })
            } else if (self.progress >= 0.99) {
              // Fully docked in Card 1
              gsap.set(flightClone, { opacity: 0 })
              gsap.set(heroBottle, { opacity: 0 })
              gsap.set(targetSlot, { opacity: 1 })
            }
          },
        },
      })

      // Compute Delta to Card 1
      const getDelta = () => {
        const curStart = heroBottle.getBoundingClientRect()
        const curEnd = targetSlot.getBoundingClientRect()
        const deltaX = (curEnd.left + curEnd.width / 2) - (curStart.left + curStart.width / 2)
        const deltaY = (curEnd.top + curEnd.height / 2) - (curStart.top + curStart.height / 2)
        const scale = curEnd.width / curStart.width
        return { deltaX, deltaY, scale }
      }

      // Trajectory: Lifts, tilts -7 degrees mid-air, then settles back to 0deg in the card slot
      scrollTween
        .to(flightClone, {
          x: () => getDelta().deltaX * 0.45,
          y: () => getDelta().deltaY * 0.45,
          scale: () => 1 + (getDelta().scale - 1) * 0.45,
          rotation: -7, // Gentle aerodynamic tilt during float
          ease: 'power1.out',
          duration: 0.5,
        })
        .to(flightClone, {
          x: () => getDelta().deltaX,
          y: () => getDelta().deltaY,
          scale: () => getDelta().scale,
          rotation: 0, // Level out flat inside Card 1
          ease: 'power2.inOut',
          duration: 0.5,
        })
    }

    // Initialize either immediately or upon hero entrance finish
    window.addEventListener('hero-animation-complete', initFlightAnimation)
    const timeout = setTimeout(initFlightAnimation, 2500)

    window.addEventListener('resize', () => {
      ScrollTrigger.refresh()
    })

    return () => {
      window.removeEventListener('hero-animation-complete', initFlightAnimation)
      clearTimeout(timeout)
      if (scrollTween) scrollTween.kill()
      if (flightClone) flightClone.remove()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white relative overflow-hidden select-none py-10 md:py-14 lg:py-18 xl:py-24 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex justify-center"
    >
      {/* Main Grid Wrapper */}
      <div className="w-full max-w-[1583px] flex flex-col items-center gap-10 sm:gap-14 lg:gap-16 xl:gap-20 relative z-10">
        
        {/* =========================================================================
            PART 1: FOUR FORMULAS
            ========================================================================= */}
        <div className="w-full flex flex-col items-center gap-6 sm:gap-8 lg:gap-9 relative z-10">
          <h2 className="text-center text-black text-[clamp(22px,2.4vw,46px)] font-normal font-['Conquera',sans-serif] leading-tight tracking-wider uppercase">
            FOUR FORMULAS
          </h2>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-4 xl:gap-6 2xl:gap-8 justify-items-center">
            {PRODUCTS.map((prod, idx) => (
              <div
                key={prod.id}
                className="w-full max-w-[310px] lg:max-w-[270px] xl:max-w-[340px] 2xl:max-w-[380px] h-[440px] sm:h-[460px] lg:h-[470px] xl:h-[540px] 2xl:h-[587px] relative bg-black rounded-[28px] sm:rounded-[34px] lg:rounded-[36px] xl:rounded-[44px] 2xl:rounded-[50px] overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.18)] group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_42px_rgba(0,0,0,0.28)] flex flex-col justify-between items-center p-4 sm:p-5 lg:p-5 xl:p-7 2xl:p-8"
              >
                {/* Title */}
                <Link
                  to={`/fragrances/${prod.slug || prod.id}`}
                  className="w-full text-center text-white text-xs sm:text-sm lg:text-[13px] xl:text-base 2xl:text-xl font-normal font-['Conquera',sans-serif] tracking-widest uppercase pt-1 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {prod.name}
                </Link>

                {/* Bottle Presentation Slot */}
                <div className="my-auto flex items-center justify-center relative w-full h-[180px] sm:h-[200px] lg:h-[210px] xl:h-[250px] 2xl:h-[280px]">
                  <img
                    id={idx === 0 ? 'target-product-slot-1' : undefined}
                    className="w-auto h-full max-h-[170px] sm:max-h-[190px] lg:max-h-[195px] xl:max-h-[235px] 2xl:max-h-[265px] object-contain drop-shadow-[0_10px_22px_rgba(255,255,255,0.06)] group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
                    src={idx === 0 ? bottle3Img : bottleImg}
                    alt={`${prod.title} Bottle`}
                    draggable={false}
                  />
                </Link>

                {/* Price & CTA */}
                <div className="w-full flex flex-col items-center gap-2.5 lg:gap-2 xl:gap-3 pb-1">
                  <div className="text-white text-base sm:text-lg lg:text-base xl:text-xl 2xl:text-2xl font-normal font-['Conquera',sans-serif] tracking-wider">
                    ₹{prod.price.toLocaleString('en-IN')}
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCart(prod)}
                    className="w-full max-w-[210px] lg:max-w-[200px] xl:max-w-[250px] 2xl:max-w-[280px] h-9 sm:h-10 lg:h-9 xl:h-12 2xl:h-14 bg-neutral-600/40 hover:bg-neutral-600/60 active:scale-95 rounded-2xl xl:rounded-3xl overflow-hidden border border-white/10 backdrop-blur-md transition-all duration-300 flex items-center justify-center cursor-pointer group/btn shadow-sm"
                    aria-label={`Add ${prod.name} to Cart`}
                  >
                    <span className="text-white text-[11px] sm:text-xs lg:text-[11px] xl:text-sm 2xl:text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-wide transition-transform group-hover/btn:scale-105">
                      Add to cart
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            PART 2: THE DISCOVERY ARCHIVE COMPOSITE
            ========================================================================= */}
        <div className="w-full relative flex flex-col items-center pt-12 sm:pt-16 lg:pt-20 xl:pt-24">
          <div className="w-[88%] sm:w-[74%] md:w-[65%] lg:w-[940px] xl:w-[1080px] max-w-[1080px] absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-0 flex items-end justify-center">
            <img
              className="w-full h-auto max-h-[600px] lg:max-h-[660px] xl:max-h-[820px] object-contain object-bottom select-none pointer-events-none"
              src={boyImg}
              alt="Chembros Model Graphic"
              draggable={false}
            />
          </div>

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
              <div className="lg:col-span-6 w-full h-[260px] sm:h-[320px] lg:h-[380px] xl:h-[460px] 2xl:h-[510px] bg-white rounded-[20px] sm:rounded-[24px] lg:rounded-[26px] xl:rounded-[30px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.06)] group">
                <img
                  className="w-full h-full object-cover object-center select-none pointer-events-none group-hover:scale-105 transition-transform duration-700 ease-out"
                  src={Discovery}
                  alt="The Discovery Archive Set"
                  draggable={false}
                />
              </Link>

              <div className="lg:col-span-6 flex flex-col justify-center space-y-3 lg:space-y-3 xl:space-y-5">
                <h3 className="text-white text-xl sm:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-normal font-['Conquera',sans-serif] leading-tight tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  THE DISCOVERY <br />
                  ARCHIVE
                </h3>

                <p className="text-white text-xs sm:text-sm lg:text-xs xl:text-sm 2xl:text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-normal tracking-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                  {discoveryArchive?.subtitle || 'The complete Molecule Series, in miniature.'}
                </p>

                <div className="text-white/90 text-[11px] sm:text-xs lg:text-[11px] xl:text-sm 2xl:text-base font-normal font-['General_Sans','Poppins',sans-serif] leading-relaxed tracking-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                  {discoveryArchive?.volume_ml ? `${Math.round(discoveryArchive.volume_ml / 3)} × 3ml Extrait` : '4 × 3ml Extrait'}<br />
                  {discoveryArchive?.category || 'Extrait de Parfum'}<br />
                  {discoveryArchive?.concentration || '25% natural oil concentration'}<br />
                  {discoveryArchive?.gender || 'Unisex'} · {discoveryArchive?.longevity || '8+ hours'}
                </div>

                <div className="pt-1.5 lg:pt-1 xl:pt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 xl:gap-6">
                  <div className="text-white text-xl sm:text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl font-normal font-['Conquera',sans-serif] tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                    {discoveryArchive ? `₹${discoveryArchive.price.toLocaleString('en-IN')}` : '₹1,299'}
                  </div>

                  <button
                    type="button"
                    disabled={!discoveryArchive}
                    onClick={() => discoveryArchive && addToCart(discoveryArchive)}
                    className="w-full sm:w-44 lg:w-40 xl:w-52 2xl:w-56 h-10 lg:h-9 xl:h-12 2xl:h-14 bg-white/85 hover:bg-white active:scale-95 rounded-2xl xl:rounded-3xl overflow-hidden transition-all duration-300 shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_24px_rgba(255,255,255,0.4)] flex items-center justify-center cursor-pointer group/btn disabled:opacity-50"
                    aria-label="Add The Discovery Archive to Cart"
                  >
                    <span className="text-black text-xs lg:text-xs xl:text-sm 2xl:text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-wide transition-transform group-hover/btn:scale-105">
                      Add to cart
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}