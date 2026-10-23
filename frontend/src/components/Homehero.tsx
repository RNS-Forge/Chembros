import heroImg from '../assets/hero.png'
import bottleImg from '../assets/bottle.png'
import NavBar from './NavBar'

export default function Homehero() {
  return (
    <section className="w-full bg-white flex justify-center overflow-x-hidden select-none relative">
      {/* 1920x983 Responsive Scaled Artboard */}
      <div
        className="w-[1920px] h-[983px] relative bg-white overflow-hidden origin-top"
        style={{
          transform: 'scale(min(1, calc(100vw / 1920)))',
          marginBottom: 'calc(983px * (min(1, calc(100vw / 1920)) - 1))',
        }}
      >
        <div className="w-[1920px] h-[1080px] left-0 top-0 absolute"></div>

        {/* Floating Navigation Pill with consistent 172px left margin */}
        <div className="left-[172px] top-[50px] absolute z-50">
          <NavBar />
        </div>

        {/* Hero Content Container with 172px margins */}
        <div className="w-[1576px] h-[1080px] left-[172px] top-0 absolute overflow-hidden">
          {/* Background Model Image pinned to top of screen */}
          <img
            className="w-[1414px] h-[1100px] left-0 top-0 absolute object-cover object-top select-none pointer-events-none"
            src={heroImg}
            alt="Chembros Hero Model"
            draggable={false}
          />

          {/* Typography + Bottles Layer */}
          <div className="w-[1576px] h-[712px] left-0 top-[269px] absolute overflow-hidden">
            <div className="w-[1617px] left-0 top-0 absolute inline-flex flex-col justify-start items-center">
              {/* Headline Row: "Chemistry captured" & "in a bottle." */}
              <div className="self-stretch inline-flex justify-between items-center">
                <div className="w-[533px] justify-center text-black text-5xl font-normal font-['Conquera',sans-serif] leading-[59.36px] uppercase tracking-wider">
                  Chemistry captured
                </div>
                <div className="w-96 justify-center text-black text-5xl font-normal font-['Conquera',sans-serif] leading-[59.36px] uppercase tracking-wider">
                  in a <br />
                  bottle.
                </div>
              </div>

              {/* 4 Perfume Bottles Row */}
              <div className="inline-flex justify-start items-center gap-14 mt-4">
                {[1, 2, 3, 4].map((id) => (
                  <div
                    key={id}
                    className="w-[306px] h-[343px] flex items-center justify-center group"
                  >
                    <img
                      className="size-80 object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
                      src={bottleImg}
                      alt={`Chembros Fragrance Bottle Formula ${id}`}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Soft Fade for Seamless Transition */}
        <div className="w-full h-32 absolute left-0 bottom-0 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-30"></div>
      </div>
    </section>
  )
}
