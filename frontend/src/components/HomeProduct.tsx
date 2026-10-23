import boyImg from '../assets/boy.png'
import bottleImg from '../assets/bottle.png'

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
  return (
    <section className="w-full bg-white flex justify-center overflow-x-hidden select-none relative">
      {/* 1920x1574 Responsive Scaled Artboard */}
      <div
        className="w-[1920px] h-[1574px] relative bg-white overflow-hidden origin-top"
        style={{
          transform: 'scale(min(1, calc(100vw / 1920)))',
          marginBottom: 'calc(1574px * (min(1, calc(100vw / 1920)) - 1))',
        }}
      >
        {/* Background Repeating Fragrances Text */}
        <div className="w-[947px] h-8 left-[486px] top-[916.82px] absolute text-center justify-center text-black text-2xl font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-6 tracking-tight z-0 pointer-events-none opacity-80">
          Fragrances Fragrances Fragrances Fragrances Fragrances Fragrances Fragrances Fragrances Fragrances Fragrances
        </div>

        {/* Lower Composite Container: Boy Model Graphic + Transparent Frosted Glass Discovery Archive Card */}
        <div className="w-[1587px] h-[1317px] left-[167px] top-[234px] absolute z-10 pointer-events-none">
          {/* Boy Graphic in native 1061x1317 resolution, perfectly unzoomed and unchopped */}
          <div className="w-[1061px] h-[1317px] left-[318px] top-0 absolute pointer-events-none">
            <img
              className="w-full h-full object-contain select-none pointer-events-none"
              src={boyImg}
              alt="Chembros Model Graphic"
              draggable={false}
            />
          </div>

          {/* More Transparent Frosted Glass Discovery Archive Card (no dark corner shadows) */}
          <div
            className="w-[1583px] h-[725px] left-[2px] top-[592px] absolute rounded-[50px] overflow-hidden z-20 pointer-events-auto"
            style={{
              background:
                'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow:
                '0 15px 35px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
            }}
          >
            {/* Left White Container with Big Bottle */}
            <div className="w-[677px] h-[521px] left-[96px] top-[102px] absolute bg-white rounded-[30px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex items-center justify-center group">
              <img
                className="w-96 h-[471px] object-contain select-none pointer-events-none drop-shadow-[0_15px_25px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform duration-500"
                src={bottleImg}
                alt="The Discovery Archive Bottle"
                draggable={false}
              />
            </div>

            {/* Title: THE DISCOVERY ARCHIVE */}
            <div className="left-[844px] top-[102px] absolute justify-center text-white text-3xl font-normal font-['Conquera',sans-serif] leading-[59.36px] tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              THE DISCOVERY <br />
              ARCHIVE
            </div>

            {/* Price: 1299 */}
            <div className="left-[865px] top-[349px] absolute justify-center text-white text-3xl font-normal font-['Conquera',sans-serif] leading-[59.36px] tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
              1299
            </div>

            {/* ADD TO CART Button */}
            <button
              type="button"
              className="w-56 h-14 left-[838px] top-[424px] absolute bg-white/85 hover:bg-white active:scale-95 rounded-3xl overflow-hidden transition-all duration-300 shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_24px_rgba(255,255,255,0.4)] flex items-center justify-center cursor-pointer group/btn"
              aria-label="Add The Discovery Archive to Cart"
            >
              <span className="text-black text-lg font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-[59.36px] tracking-wider uppercase transition-transform group-hover/btn:scale-105">
                ADD TO CART
              </span>
            </button>
          </div>
        </div>

        {/* Top Product Section: Header + 4 Black Cards */}
        <div className="w-[1573px] left-[173px] top-[89px] absolute inline-flex flex-col justify-start items-center gap-10 z-30 pointer-events-auto">
          {/* Header: FOUR FORMULAS */}
          <div className="text-center justify-center text-black text-4xl font-normal font-['Conquera',sans-serif] leading-[59.36px] tracking-wider uppercase">
            FOUR FORMULAS
          </div>

          {/* 4 Black Product Cards Row */}
          <div className="self-stretch inline-flex justify-start items-center gap-9">
            {PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="w-96 h-[587px] relative bg-black rounded-[50px] overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.18)] group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(0,0,0,0.3)]"
              >
                {/* Molecule Title - Clean Single Line Centered */}
                <div className="w-full text-center left-0 top-[26px] absolute justify-center text-white text-xl font-normal font-['Conquera',sans-serif] leading-[59.36px] tracking-widest uppercase whitespace-nowrap">
                  {prod.title}
                </div>

                {/* Bottle Image */}
                <img
                  className="w-60 h-64 left-1/2 -translate-x-1/2 top-[125px] absolute object-contain drop-shadow-[0_15px_30px_rgba(255,255,255,0.06)] group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-500 select-none pointer-events-none"
                  src={bottleImg}
                  alt={`${prod.title} Bottle`}
                  draggable={false}
                />

                {/* Price */}
                <div className="w-full text-center left-0 top-[428px] absolute justify-center text-white text-2xl font-normal font-['Conquera',sans-serif] leading-[59.36px] tracking-wider">
                  {prod.price}
                </div>

                {/* Add to cart Button */}
                <button
                  type="button"
                  className="w-72 h-14 left-1/2 -translate-x-1/2 top-[494px] absolute bg-neutral-600/40 hover:bg-neutral-600/60 active:scale-95 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-md transition-all duration-300 flex items-center justify-center cursor-pointer group/btn shadow-md"
                  aria-label={`Add ${prod.title} to Cart`}
                >
                  <span className="text-white text-lg font-medium font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-[59.36px] tracking-wide transition-transform group-hover/btn:scale-105">
                    Add to cart
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
