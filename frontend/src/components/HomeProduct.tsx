import React from 'react'
import boyImg from '../assets/tonedboy.png'
import bottleImg from '../assets/bottle.png'
import { getProductsApi } from '../services/api'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'

export default function HomeProduct() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProductsApi()
        setProducts(data)
      } catch (err) {
        console.error('Failed to load products from live DB:', err)
      }
    }
    loadProducts()
  }, [])

  const fourFormulas = products
    .filter((item) => !item.is_archive)
    .sort((a, b) => (a.code || '').localeCompare(b.code || '') || (Number(a.id) - Number(b.id)))
  const discoveryArchive = products.find((item) => item.is_archive)

  return (
    <section className="w-full bg-white relative overflow-hidden select-none py-10 md:py-14 lg:py-16 px-4 sm:px-6 md:px-8 lg:px-12 flex justify-center">

      {/* =========================================================================
          GLOBAL MODEL GRAPHIC (z-0: Behind EVERYTHING including the top 4 cards)
          Bottom is aligned flush with the bottom container
          ========================================================================= */}
      <div className="w-[85%] sm:w-[70%] md:w-[62%] lg:w-[1080px] max-w-[1080px] h-[52%] sm:h-[55%] lg:h-[58%] absolute bottom-10 md:bottom-14 lg:bottom-16 left-1/2 -translate-x-1/2 pointer-events-none z-0 flex items-end justify-center overflow-hidden">
        <img
          className="w-full h-full object-contain object-bottom select-none pointer-events-none"
          src={boyImg}
          alt="Chembros Model Graphic"
          draggable={false}
        />
      </div>

      {/* Outer Content Container (z-10: Sits above the background model) */}
      <div className="w-full max-w-[1583px] flex flex-col items-center gap-10 sm:gap-14 lg:gap-16 relative z-10">

        {/* =========================================================================
            PART 1: FOUR FORMULAS (Above model z-index)
            ========================================================================= */}
        <div className="w-full flex flex-col items-center gap-6 sm:gap-8 relative z-10">

          <h2 className="text-center text-black text-[clamp(24px,2.6vw,48px)] font-normal font-['Conquera',sans-serif] leading-tight tracking-wider uppercase">
            FOUR FORMULAS
          </h2>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-items-center">
            {PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="w-full max-w-[380px] h-[460px] sm:h-[500px] lg:h-[587px] relative bg-black rounded-[32px] sm:rounded-[40px] lg:rounded-[50px] overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.18)] group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(0,0,0,0.3)] flex flex-col justify-between items-center p-5 sm:p-6 lg:p-8"
              >
                {/* Title */}
                <div className="w-full text-center text-white text-[clamp(15px,1.2vw,22px)] font-normal font-['Conquera',sans-serif] tracking-widest uppercase pt-1">
                  {prod.title}
                </div>

                {/* Bottle */}
                <div className="my-auto py-2 flex items-center justify-center relative w-full">
                  <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-full bg-white/5 blur-2xl absolute pointer-events-none group-hover:scale-125 transition-transform duration-700" />
                  <img
                    className="w-44 sm:w-48 lg:w-60 h-48 sm:h-52 lg:h-64 object-contain drop-shadow-[0_15px_30px_rgba(255,255,255,0.06)] group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-500 select-none pointer-events-none"
                    src={bottleImg}
                    alt={`${prod.title} Bottle`}
                    draggable={false}
                  />
                </div>

                {/* Price & CTA */}
                <div className="w-full flex flex-col items-center gap-3 pb-1">
                  <div className="text-white text-[clamp(18px,1.4vw,26px)] font-normal font-['Conquera',sans-serif] tracking-wider">
                    {prod.price}
                  </div>

                  <button
                    type="button"
                    className="w-full max-w-[280px] h-11 sm:h-12 lg:h-14 bg-neutral-600/40 hover:bg-neutral-600/60 active:scale-95 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-md transition-all duration-300 flex items-center justify-center cursor-pointer group/btn shadow-md"
                    aria-label={`Add ${prod.title} to Cart`}
                  >
                    <span className="text-white text-[clamp(13px,0.95vw,17px)] font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-wide transition-transform group-hover/btn:scale-105">
                      Add to cart
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* =========================================================================
            PART 2: THE DISCOVERY ARCHIVE FROSTED GLASS CARD
            Bottom edge sits flush with the model graphic
            ========================================================================= */}
        <div className="w-full relative flex flex-col items-center pt-10 sm:pt-16 lg:pt-24 z-10">

          <div
            className="w-full min-h-[480px] sm:min-h-[520px] lg:h-[725px] rounded-[32px] sm:rounded-[42px] lg:rounded-[50px] p-5 sm:p-8 lg:p-14 relative z-10 pointer-events-auto overflow-hidden flex items-center shadow-[0_15px_35px_rgba(0,0,0,0.12),_inset_0_1px_1px_rgba(255,255,255,0.6)]"
            style={{
              background:
                'linear-gradient(227deg, rgba(0, 0, 0, 0.35) 6%, rgba(255, 255, 255, 0.25) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">

              {/* Left Container with Big Bottle */}
              <div className="lg:col-span-6 w-full h-[280px] sm:h-[360px] lg:h-[500px] bg-white rounded-[22px] sm:rounded-[28px] lg:rounded-[30px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex items-center justify-center p-4 sm:p-6 group">
                <img
                  className="w-auto h-full max-h-[440px] object-contain select-none pointer-events-none drop-shadow-[0_15px_25px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform duration-500"
                  src={bottleImg}
                  alt="The Discovery Archive Bottle"
                  draggable={false}
                />
              </div>

              {/* Right Side: Typography & Button */}
              <div className="lg:col-span-6 flex flex-col justify-center space-y-3 sm:space-y-4 lg:space-y-5">

                {/* Title */}
                <h3 className="text-white text-[clamp(20px,2.2vw,36px)] font-normal font-['Conquera',sans-serif] leading-tight lg:leading-10 tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  THE DISCOVERY <br />
                  ARCHIVE
                </h3>

                {/* Subtitle */}
                <p className="text-white text-[clamp(13px,0.95vw,17px)] font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-normal tracking-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                  The complete Molecule Series, in miniature.
                </p>

                {/* Specs */}
                <div className="text-white/90 text-[clamp(11px,0.85vw,15px)] font-normal font-['General_Sans','Poppins',sans-serif] leading-relaxed tracking-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                  4 × 3ml Extrait<br />
                  Extrait de Parfum<br />
                  25% natural oil concentration<br />
                  Unisex · 8+ hours
                </div>

                {/* Price and Add to Cart */}
                <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                  <div className="text-white text-[clamp(20px,1.6vw,28px)] font-normal font-['Conquera',sans-serif] tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                    ₹1299
                  </div>

                  <button
                    type="button"
                    className="w-full sm:w-52 h-11 sm:h-13 lg:h-14 bg-white/85 hover:bg-white active:scale-95 rounded-3xl overflow-hidden transition-all duration-300 shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_24px_rgba(255,255,255,0.4)] flex items-center justify-center cursor-pointer group/btn"
                    aria-label="Add The Discovery Archive to Cart"
                  >
                    <span className="text-black text-[clamp(13px,0.95vw,17px)] font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-wide transition-transform group-hover/btn:scale-105">
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