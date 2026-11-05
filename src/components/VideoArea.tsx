'use client'
import { useState, useRef } from 'react'
import { Star } from 'lucide-react'

const DEFAULT_CLOUDINARY_EMBED = 'https://player.cloudinary.com/embed/?cloud_name=o2iumbkf&public_id=WhatsApp_Video_2026-10-28_at_12.32.21_PM'
const DEFAULT_CLOUDINARY_STREAM = 'https://res.cloudinary.com/o2iumbkf/video/upload/WhatsApp_Video_2026-10-28_at_12.32.21_PM.mp4'

const Vid = DEFAULT_CLOUDINARY_STREAM

function resolveMediaSource(src: string): { streamUrl: string; embedUrl: string } {
  if (src.includes('player.cloudinary.com/embed')) {
    try {
      const url = new URL(src)
      const cloudName = url.searchParams.get('cloud_name')
      const publicId = url.searchParams.get('public_id')
      if (cloudName && publicId) {
        return {
          streamUrl: `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}.mp4`,
          embedUrl: src,
        }
      }
    } catch {}
  } else if (src.includes('res.cloudinary.com') && src.includes('/video/upload/')) {
    try {
      const match = src.match(/res\.cloudinary\.com\/([^/]+)\/video\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
      if (match) {
        return {
          streamUrl: src,
          embedUrl: `https://player.cloudinary.com/embed/?cloud_name=${match[1]}&public_id=${match[2]}`,
        }
      }
    } catch {}
  }
  return { streamUrl: src, embedUrl: src }
}

interface BrandStoryProtocolProps {
  videoSrc?: string
  videoPoster?: string
}

interface Testimonial {
  id: string
  clientName: string
  location: string
  formula: string
  review: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '01',
    clientName: 'Aarav M.',
    location: 'Bengaluru',
    formula: 'Molecule X',
    review:
      'A true second-skin fragrance. The sandalwood and Iso E Super blend effortlessly with body heat—clean, subtle, and people consistently ask what smells so remarkable when I walk past.',
  },
  {
    id: '02',
    clientName: 'Dev P.',
    location: 'Mumbai',
    formula: 'Molecule T',
    review:
      'Crisp bergamot opening that settles into an exceptional black tea and ambroxan steam. You can immediately feel the pure parfum concentration with zero synthetic residue.',
  },
  {
    id: '03',
    clientName: 'Kavya S.',
    location: 'New Delhi',
    formula: 'Discovery Archive',
    review:
      'The 4-vial archive is beautifully packaged. Comparing Molecule J against Molecule K over a weekend made deciding on full bottles effortless. An absolute work of art.',
  },
  {
    id: '04',
    clientName: 'Rohan K.',
    location: 'Chennai',
    formula: 'Molecule K',
    review:
      'Warm resin and petrichor unlike anything else in my collection. Held up through a humid 10-hour day and was still noticeable past midnight. Pure extract potency.',
  },
]

export default function BrandStoryProtocol({
  videoSrc = Vid,
  videoPoster = 'https://placehold.co/1578x888',
}: BrandStoryProtocolProps) {
  const [isMuted, setIsMuted] = useState<boolean>(true)
  const [useIframeFallback, setUseIframeFallback] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const media = resolveMediaSource(videoSrc)

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  return (
    <section className="w-full bg-white flex justify-center overflow-hidden select-none py-12 sm:py-16 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative">
      
      {/* Ambient gradient mesh beneath the cards so the glass frosting has real depth to refract */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[340px] bg-gradient-to-r from-neutral-200/40 via-sky-100/30 to-neutral-200/40 rounded-full blur-[100px] pointer-events-none -z-0" />

      <div className="w-full max-w-[1583px] flex flex-col gap-14 sm:gap-20 lg:gap-24 relative z-10">

        {/* ========================================================
            PART 1: CINEMATIC 16:9 VIDEO FRAME
            ======================================================== */}
        <div className="w-full aspect-video max-h-[760px] relative bg-neutral-900 rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] group border border-black/5">
          {useIframeFallback ? (
            <iframe
              src={`${media.embedUrl}${media.embedUrl.includes('?') ? '&' : '?'}autoplay=true&loop=true&muted=true`}
              className="w-full h-full border-0 select-none"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              title="Chembros Craftsmanship"
            />
          ) : media.streamUrl ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover select-none pointer-events-none"
              src={media.streamUrl}
              poster={videoPoster}
              autoPlay
              loop
              muted
              playsInline
              onError={() => setUseIframeFallback(true)}
            />
          ) : (
            <img
              className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-700"
              src={videoPoster}
              alt="Chembros Craftsmanship"
              draggable={false}
            />
          )}

          {/* Sound Control Pill */}
          {!useIframeFallback && media.streamUrl && (
            <button
              type="button"
              onClick={toggleSound}
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              className="right-4 bottom-4 sm:right-6 sm:bottom-6 lg:right-8 lg:bottom-8 absolute z-20 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-xl border border-white/20 text-white font-mono text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-300 flex items-center gap-2 active:scale-95 cursor-pointer shadow-lg"
            >
              {isMuted ? (
                <>
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                  <span>Sound Off</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                  <span>Sound On</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* ========================================================
            PART 2: AUTHENTIC APPLE FROSTED GLASS CARDS
            ======================================================== */}
        <div className="w-full flex flex-col gap-8 sm:gap-10">
          
          {/* Header */}
          <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between border-b border-black/10 pb-5 gap-3">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase text-black/45 block mb-1">
                COMMUNITY IMPRESSIONS
              </span>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-normal font-['Conquera',sans-serif] uppercase tracking-wider text-black">
                WEAR EXPERIENCES
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-black/70 bg-neutral-100/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-black/5 shadow-sm w-fit">
              <div className="flex items-center text-amber-500 gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="font-semibold text-black">5.0</span>
              <span className="text-black/45">/ Verified Patrons</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {TESTIMONIALS.map((item) => (
              <div
                key={item.id}
                className="w-full rounded-[28px] p-6 lg:p-7 flex flex-col justify-between relative transition-all duration-300 group cursor-default hover:-translate-y-1.5"
                style={{
                  // Authentic iOS glass tinting & multi-layer edge refraction
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.78) 0%, rgba(246, 248, 250, 0.52) 100%)',
                  backdropFilter: 'blur(28px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: `
                    0 18px 36px -12px rgba(0, 0, 0, 0.08),
                    0 6px 12px -4px rgba(0, 0, 0, 0.04),
                    inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.95),
                    inset 0 -1px 1px 0 rgba(0, 0, 0, 0.03)
                  `,
                }}
              >
                {/* Top: Stars & Glass Pill Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="flex items-center text-black/85 gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-black text-black" />
                      ))}
                    </div>

                    <span
                      className="text-[10px] font-mono tracking-widest text-black/75 px-3 py-1 rounded-full uppercase font-medium"
                      style={{
                        background: 'rgba(255, 255, 255, 0.65)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 2px 6px rgba(0, 0, 0, 0.03)',
                      }}
                    >
                      {item.formula}
                    </span>
                  </div>

                  {/* Review Quote */}
                  <p className="text-[13px] sm:text-[13.5px] leading-relaxed text-black/85 font-normal tracking-tight">
                    "{item.review}"
                  </p>
                </div>

                {/* Bottom: Reviewer details & Verified Chip */}
                <div className="pt-5 mt-6 border-t border-black/[0.08] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-black tracking-tight">
                      {item.clientName}
                    </div>
                    <div className="text-[10px] font-mono tracking-wider text-black/50 mt-0.5">
                      {item.location}
                    </div>
                  </div>

                  <span
                    className="text-[9px] font-mono tracking-widest text-emerald-800 px-2.5 py-1 rounded-full uppercase font-semibold"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  )
}