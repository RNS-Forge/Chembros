import { useState, useRef } from 'react'
import Vid from '../assets/video/introvideo.mp4'

interface BrandStoryProtocolProps {
  videoSrc?: string
  videoPoster?: string
}

interface Testimonial {
  id: string
  clientName: string
  location: string
  formula: string
  rating: string
  longevity: string
  projection: string
  quote: string
  review: string
  verifiedDate: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '01',
    clientName: 'AARAV M.',
    location: 'BENGALURU',
    formula: 'MOLECULE X',
    rating: '5.0 / 5.0',
    longevity: '11+ HOURS',
    projection: 'INTIMATE & SUBTLE',
    quote: 'A SECOND-SKIN SCENT THAT EVOLVES ALL DAY.',
    review:
      'The sandalwood and Iso E Super blend effortlessly with body heat. It does not overpower the room; instead, people consistently ask what smells so remarkably clean whenever I walk past.',
    verifiedDate: 'VERIFIED BUYER',
  },
  {
    id: '02',
    clientName: 'DEV P.',
    location: 'MUMBAI',
    formula: 'MOLECULE T',
    rating: '5.0 / 5.0',
    longevity: '9+ HOURS',
    projection: 'MODERATE',
    quote: 'THE BLACK TEA AND AMBROXAN NOTE IS MASTERFUL.',
    review:
      'Opens with a crisp, cool bergamot burst before settling into a warm, aromatic black tea steam. You can immediately feel the pure oil concentration—leaves zero chemical residue on dry down.',
    verifiedDate: 'VERIFIED BUYER',
  },
  {
    id: '03',
    clientName: 'KAVYA S.',
    location: 'NEW DELHI',
    formula: 'DISCOVERY ARCHIVE',
    rating: '5.0 / 5.0',
    longevity: '10+ HOURS',
    projection: 'BALANCED',
    quote: 'THE COMPACT VIALS ARE ABSOLUTE WORKS OF ART.',
    review:
      'Ordered the 4-vial set before deciding on a full bottle. Testing Molecule J versus Molecule K over a weekend convinced me to get both. Beautiful luxury packaging.',
    verifiedDate: 'VERIFIED BUYER',
  },
  {
    id: '04',
    clientName: 'ROHAN K.',
    location: 'CHENNAI',
    formula: 'MOLECULE K',
    rating: '5.0 / 5.0',
    longevity: '14+ HOURS',
    projection: 'STRONG',
    quote: 'PETRICHOR AND FRANKINCENSE UNLIKE ANYTHING ELSE.',
    review:
      'Smells like rain on volcanic stones and warm resin. Survived a full 10-hour humid day and was still noticeable by midnight. Real parfum concentration in every drop.',
    verifiedDate: 'VERIFIED BUYER',
  },
]

export default function BrandStoryProtocol({
  videoSrc = Vid,
  videoPoster = 'https://placehold.co/1578x888',
}: BrandStoryProtocolProps) {
  const [activeCard, setActiveCard] = useState<number>(0)
  const [isMuted, setIsMuted] = useState<boolean>(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  return (
    <section className="w-full bg-white flex justify-center overflow-hidden select-none py-10 sm:py-14 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      {/* Fluid Max-Width Container matching HomeProduct & HomeCta */}
      <div className="w-full max-w-[1583px] flex flex-col gap-12 sm:gap-16 lg:gap-20">
        
        {/* ========================================================
            PART 1: CINEMATIC 16:9 VIDEO FRAME
            ======================================================== */}
        <div className="w-full aspect-video max-h-[760px] relative bg-neutral-900 rounded-[28px] sm:rounded-[36px] lg:rounded-[48px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] group">
          {videoSrc ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover select-none pointer-events-none"
              src={videoSrc}
              poster={videoPoster}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-700"
              src={videoPoster}
              alt="Chembros Craftsmanship"
              draggable={false}
            />
          )}

          {/* Floating Sound Control Pill */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            className="right-4 bottom-4 sm:right-6 sm:bottom-6 lg:right-8 lg:bottom-8 absolute z-20 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-xl border border-white/20 text-white font-mono text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-300 flex items-center gap-2 active:scale-95 cursor-pointer shadow-lg"
          >
            {isMuted ? (
              <>
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
                <span>Sound Off</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
                <span>Sound On</span>
              </>
            )}
          </button>
        </div>

        {/* ========================================================
            PART 2: TESTIMONIAL REVIEWS GRID
            ======================================================== */}
        <div className="w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-black/10">
            <div>
              <span className="text-[11px] sm:text-xs font-mono tracking-[0.25em] uppercase text-black/50 block mb-1">
                COMMUNITY REVIEWS
              </span>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-normal font-['Conquera',sans-serif] uppercase tracking-wider text-black">
                WEAR REPORTS & EXPERIENCE
              </h3>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {TESTIMONIALS.map((item, idx) => {
              const isActive = activeCard === idx
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveCard(idx)}
                  onMouseEnter={() => setActiveCard(idx)}
                  className={`relative min-h-[460px] sm:min-h-[480px] lg:h-[500px] xl:h-[520px] rounded-[28px] sm:rounded-[34px] lg:rounded-[40px] p-6 lg:p-7 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden border ${
                    isActive
                      ? 'bg-black text-white border-black shadow-[0_20px_40px_rgba(0,0,0,0.18)] -translate-y-1.5'
                      : 'bg-[#F7F9FA] text-black border-black/5 hover:border-black/15 hover:bg-[#EEF2F5]'
                  }`}
                >
                  {/* Subtle Top-Right Ambient Glow */}
                  {isActive && (
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl pointer-events-none rounded-full" />
                  )}

                  {/* Header: Name, Location, Formula */}
                  <div>
                    <div className="flex items-start justify-between gap-2 pb-4 border-b border-current/10">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest uppercase opacity-50 block">
                          {item.verifiedDate}
                        </span>
                        <div className="text-xs sm:text-sm font-bold font-mono tracking-wide mt-0.5">
                          {item.clientName} · {item.location}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
                          isActive
                            ? 'border-white/30 bg-white/10 text-white'
                            : 'border-black/15 bg-black/5 text-black'
                        }`}
                      >
                        {item.formula}
                      </span>
                    </div>

                    {/* Metric Badges */}
                    <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-current/5 border border-current/10 font-mono text-[10px]">
                      <div>
                        <span className="opacity-50 uppercase block text-[9px]">LONGEVITY</span>
                        <span className="font-semibold block mt-0.5">{item.longevity}</span>
                      </div>
                      <div>
                        <span className="opacity-50 uppercase block text-[9px]">PROJECTION</span>
                        <span className="font-semibold block mt-0.5 truncate">{item.projection}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quote & Review */}
                  <div className="my-auto py-3">
                    <h4 className="text-sm sm:text-base lg:text-sm xl:text-base font-normal font-['Conquera',sans-serif] tracking-wider uppercase leading-snug">
                      "{item.quote}"
                    </h4>
                    <p className="mt-3 text-xs leading-relaxed font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] opacity-80">
                      {item.review}
                    </p>
                  </div>

                  {/* Footer: Star Rating */}
                  <div className="pt-4 border-t border-current/10 flex items-center justify-between font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-400">★★★★★</span>
                      <span className="opacity-70 text-[10px]">{item.rating}</span>
                    </div>
                    <span className="opacity-40 uppercase tracking-widest text-[9px]">
                      SCENT ARCHIVE
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}