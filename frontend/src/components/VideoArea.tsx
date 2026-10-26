import React, { useState, useRef } from 'react'
import Vid from '../assets/video/introvideo.mp4';

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
  longevityTested: string
  sillageRating: string
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
    longevityTested: '11.5 HRS',
    sillageRating: 'INTIMATE · RADIAL',
    quote: 'A SECOND-SKIN SILLAGE THAT EVOLVES ALL DAY.',
    review:
      'The sandalwood and Iso E Super melt effortlessly with body heat. It doesn’t scream for attention like commercial EDPs; instead, people keep asking what smells so remarkably clean whenever I walk past.',
    verifiedDate: 'OCT 2026 // BATCH 01',
  },
  {
    id: '02',
    clientName: 'DEV P.',
    location: 'MUMBAI',
    formula: 'MOLECULE T',
    rating: '5.0 / 5.0',
    longevityTested: '9.0 HRS',
    sillageRating: 'DIFFUSIVE',
    quote: 'THE BLACK TEA AND AMBROXAN NOTE IS MASTERFUL.',
    review:
      'Opens with this sharp, cold bergamot burst before settling into a warm, mineral black tea steam. You can immediately feel the heavy oil concentration—leaves zero chemical residue on dry down.',
    verifiedDate: 'SEP 2026 // BATCH 02',
  },
  {
    id: '03',
    clientName: 'KAVYA S.',
    location: 'NEW DELHI',
    formula: 'DISCOVERY ARCHIVE',
    rating: '5.0 / 5.0',
    longevityTested: '8–12 HRS',
    sillageRating: 'MODERATE · HIGH',
    quote: 'THE COMPACT VIALS ARE ABSOLUTE WORKS OF ART.',
    review:
      'Ordered the 4-vial archive before deciding on a full 30ml bottle. Testing the skin evolution of Molecule J vs Molecule K over a weekend convinced me to buy both. Exceptional lab packaging.',
    verifiedDate: 'OCT 2026 // ARCHIVE 04',
  },
  {
    id: '04',
    clientName: 'ROHAN K.',
    location: 'CHENNAI',
    formula: 'MOLECULE K',
    rating: '5.0 / 5.0',
    longevityTested: '14.0 HRS',
    sillageRating: 'HEAVY PROJECTION',
    quote: 'PETRICHOR AND FRANKINCENSE UNLIKE ANYTHING ELSE.',
    review:
      'Smells like rain on cold volcanic stones and church resin. It survived a 10-hour workday in humid heat and was still projecting softly by midnight. Authentic Extrait concentration in every drop.',
    verifiedDate: 'AUG 2026 // BATCH 01',
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
    <section className="w-full bg-white flex justify-center overflow-x-hidden select-none py-14">
      {/* 1576px Responsive Scaled Container */}
      <div
        className="w-[1576px] flex flex-col justify-start items-start gap-16 origin-top"
        style={{
          transform: 'scale(min(1, calc((100vw - 48px) / 1576)))',
          marginBottom: 'calc(1650px * (min(1, calc((100vw - 48px) / 1576)) - 1))',
        }}
      >
        {/* ========================================================
            PART 1: CLEAN VIDEO FRAME WITH MUTE/UNMUTE CONTROL (799px)
            ======================================================== */}
        <div className="w-full h-[799px] relative bg-neutral-900 rounded-[50px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] group">
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
              alt="Chembros Atelier Video"
              draggable={false}
            />
          )}

          {/* Minimalist Floating Mute/Unmute Pill */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            className="right-8 bottom-8 absolute z-20 px-4 py-2.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xl border border-white/20 text-white font-mono text-xs tracking-wider uppercase transition-all duration-300 flex items-center gap-2.5 active:scale-95 cursor-pointer shadow-lg"
          >
            {isMuted ? (
              <>
                <svg
                  className="w-4 h-4 text-white/80"
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
                  className="w-4 h-4 text-white"
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
            PART 2: 4-BOX LABORATORY TESTIMONIAL DOSSIERS
            ======================================================== */}
        <div className="w-full">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-black/10">
            <div>
              <span className="text-xs font-mono tracking-[0.3em] uppercase text-black/50 block mb-2">
                VERIFIED ARCHIVE DOSSIERS
              </span>
              <h3 className="text-3xl font-normal font-['Conquera',sans-serif] uppercase tracking-wider text-black">
                OBSERVATIONS & WEAR REPORTS
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-black/50 uppercase">
              <span className="w-2 h-2 rounded-full bg-black/80" />
              <span>4.9 / 5.0 AGGREGATE LAB RATING</span>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((item, idx) => {
              const isActive = activeCard === idx
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setActiveCard(idx)}
                  className={`relative h-[680px] rounded-[45px] p-8 flex flex-col justify-between transition-all duration-500 cursor-pointer overflow-hidden border ${
                    isActive
                      ? 'bg-black text-white border-black shadow-[0_25px_50px_rgba(0,0,0,0.22)] -translate-y-2'
                      : 'bg-[#F6F8FA] text-black border-black/5 hover:border-black/20 hover:bg-[#EFF2F5]'
                  }`}
                >
                  {/* Active Card Subtle Glow */}
                  {isActive && (
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl pointer-events-none rounded-full" />
                  )}

                  {/* Card Header: Client Info & Formula Tag */}
                  <div>
                    <div className="flex items-center justify-between pb-5 border-b border-current/10">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest uppercase opacity-50 block">
                          VERIFIED CLIENT
                        </span>
                        <div className="text-sm font-bold font-mono tracking-wide mt-0.5">
                          {item.clientName} · {item.location}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border ${
                          isActive
                            ? 'border-white/30 bg-white/10 text-white'
                            : 'border-black/15 bg-black/5 text-black'
                        }`}
                      >
                        {item.formula}
                      </span>
                    </div>

                    {/* Metric Badges */}
                    <div className="grid grid-cols-2 gap-2 mt-5 p-3 rounded-2xl bg-current/5 border border-current/10 font-mono text-[10px]">
                      <div>
                        <span className="opacity-40 uppercase block">SKIN LONGEVITY</span>
                        <span className="font-semibold block mt-0.5">{item.longevityTested}</span>
                      </div>
                      <div>
                        <span className="opacity-40 uppercase block">SILLAGE DENSITY</span>
                        <span className="font-semibold block mt-0.5 truncate">{item.sillageRating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial Quote & Review Body */}
                  <div className="my-auto py-4">
                    <div className="text-[11px] font-mono tracking-widest opacity-40 mb-2">
                      DOSSIER // {item.id}
                    </div>
                    <h4 className="text-xl font-normal font-['Conquera',sans-serif] tracking-wider uppercase leading-snug">
                      "{item.quote}"
                    </h4>
                    <p className="mt-4 text-xs leading-relaxed font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] opacity-80">
                      {item.review}
                    </p>
                  </div>

                  {/* Card Footer: Stars & Batch Tag */}
                  <div className="pt-5 border-t border-current/10 flex items-center justify-between font-mono text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-400">★★★★★</span>
                      <span className="opacity-60">{item.rating}</span>
                    </div>
                    <span className="opacity-40 uppercase tracking-widest">
                      {item.verifiedDate}
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