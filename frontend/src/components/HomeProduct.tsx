import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import boyImg from '../assets/tonedboy.png'
import bottleImg from '../assets/bg/1.png'

interface ProductCardItem {
  id: number
  title: string
  price: string
}

const PRODUCTS: ProductCardItem[] = [
  { id: 1, title: 'Molecule x', price: '₹1299' },
  { id: 2, title: 'Molecule x', price: '₹1299' },
  { id: 3, title: 'Molecule x', price: '₹1299' },
  { id: 4, title: 'Molecule x', price: '₹1299' },
]

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
    .filter((item: Product) => !item.is_archive)
    .sort((a: Product, b: Product) => (a.code || '').localeCompare(b.code || '') || (Number(a.id) - Number(b.id)))
  const discoveryArchive = products.find((item: Product) => item.is_archive)

  return (
    <section className="w-full bg-white relative overflow-hidden select-none py-10 md:py-14 lg:py-18 xl:py-24 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex justify-center">
      
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
            {PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="w-full max-w-[310px] lg:max-w-[270px] xl:max-w-[340px] 2xl:max-w-[380px] h-[440px] sm:h-[460px] lg:h-[470px] xl:h-[540px] 2xl:h-[587px] relative bg-black rounded-[28px] sm:rounded-[34px] lg:rounded-[36px] xl:rounded-[44px] 2xl:rounded-[50px] overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.18)] group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_42px_rgba(0,0,0,0.28)] flex flex-col justify-between items-center p-4 sm:p-5 lg:p-5 xl:p-7 2xl:p-8"
              >
                <div className="w-full text-center text-white text-xs sm:text-sm lg:text-[13px] xl:text-base 2xl:text-xl font-normal font-['Conquera',sans-serif] tracking-widest uppercase pt-1">
                  {prod.title}
                </div>

                <div className="my-auto flex items-center justify-center relative w-full h-[180px] sm:h-[200px] lg:h-[210px] xl:h-[250px] 2xl:h-[280px]">
                  <img
                    className="w-auto h-full max-h-[170px] sm:max-h-[190px] lg:max-h-[195px] xl:max-h-[235px] 2xl:max-h-[265px] object-contain drop-shadow-[0_10px_22px_rgba(255,255,255,0.06)] group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
                    src={bottleImg}
                    alt={`${prod.title} Bottle`}
                    draggable={false}
                  />
                </Link>

                <div className="w-full flex flex-col items-center gap-2.5 lg:gap-2 xl:gap-3 pb-1">
                  <div className="text-white text-base sm:text-lg lg:text-base xl:text-xl 2xl:text-2xl font-normal font-['Conquera',sans-serif] tracking-wider">
                    {prod.price}
                  </div>

                  <button
                    type="button"
                    className="w-full max-w-[210px] lg:max-w-[200px] xl:max-w-[250px] 2xl:max-w-[280px] h-9 sm:h-10 lg:h-9 xl:h-12 2xl:h-14 bg-neutral-600/40 hover:bg-neutral-600/60 active:scale-95 rounded-2xl xl:rounded-3xl overflow-hidden border border-white/10 backdrop-blur-md transition-all duration-300 flex items-center justify-center cursor-pointer group/btn shadow-sm"
                    aria-label={`Add ${prod.title} to Cart`}
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
            Model graphic and frosted card share the same container.
            bottom-0 ensures both are perfectly aligned at the bottom edge.
            ========================================================================= */}
        <div className="w-full relative flex flex-col items-center pt-12 sm:pt-16 lg:pt-20 xl:pt-24">
          
          {/* Background Model Graphic: Positioned strictly at bottom-0 of the card container */}
          <div className="w-[88%] sm:w-[74%] md:w-[65%] lg:w-[940px] xl:w-[1080px] max-w-[1080px] absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-0 flex items-end justify-center">
            <img
              className="w-full h-auto max-h-[600px] lg:max-h-[660px] xl:max-h-[820px] object-contain object-bottom select-none pointer-events-none"
              src={boyImg}
              alt="Chembros Model Graphic"
              draggable={false}
            />
          </div>

          {/* Frosted Glass Card: Sits directly over the model with z-10 */}
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
              
              {/* Left Container with Large Bottle */}
              <div className="lg:col-span-6 w-full h-[260px] sm:h-[320px] lg:h-[380px] xl:h-[460px] 2xl:h-[510px] bg-white rounded-[20px] sm:rounded-[24px] lg:rounded-[26px] xl:rounded-[30px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.06)] flex items-center justify-center p-4 sm:p-6 group">
                <img
                  className="w-auto h-full max-h-[240px] sm:max-h-[300px] lg:max-h-[350px] xl:max-h-[420px] 2xl:max-h-[460px] object-contain select-none pointer-events-none drop-shadow-[0_12px_22px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform duration-500"
                  src={bottleImg}
                  alt="The Discovery Archive Bottle"
                  draggable={false}
                />
              </Link>

              {/* Right Side: Typography & Button */}
              <div className="lg:col-span-6 flex flex-col justify-center space-y-3 lg:space-y-3 xl:space-y-5">
                
                <h3 className="text-white text-xl sm:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-normal font-['Conquera',sans-serif] leading-tight tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  THE DISCOVERY <br />
                  ARCHIVE
                </h3>

                <p className="text-white text-xs sm:text-sm lg:text-xs xl:text-sm 2xl:text-base font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-normal tracking-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                  The complete Molecule Series, in miniature.
                </p>

                <div className="text-white/90 text-[11px] sm:text-xs lg:text-[11px] xl:text-sm 2xl:text-base font-normal font-['General_Sans','Poppins',sans-serif] leading-relaxed tracking-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                  4 × 3ml Extrait<br />
                  Extrait de Parfum<br />
                  25% natural oil concentration<br />
                  Unisex · 8+ hours
                </div>

                <div className="pt-1.5 lg:pt-1 xl:pt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 xl:gap-6">
                  <div className="text-white text-xl sm:text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl font-normal font-['Conquera',sans-serif] tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                    ₹1299
                  </div>

                  <button
                    type="button"
                    className="w-full sm:w-44 lg:w-40 xl:w-52 2xl:w-56 h-10 lg:h-9 xl:h-12 2xl:h-14 bg-white/85 hover:bg-white active:scale-95 rounded-2xl xl:rounded-3xl overflow-hidden transition-all duration-300 shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_24px_rgba(255,255,255,0.4)] flex items-center justify-center cursor-pointer group/btn"
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