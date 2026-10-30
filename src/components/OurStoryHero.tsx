'use client'
import React, { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Herobg from '../assets/footerbg.png';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_STORY_BG = (Herobg as any)?.src || Herobg;

interface StoryCardItem {
  id: number;
  tag: string;
  title: string;
  body: string;
  highlight?: string;
  img: string;
}

const STORY_ITEMS: StoryCardItem[] = [
  {
    id: 1,
    tag: '1 ORIGIN',
    title: 'WHERE IT BEGAN',
    body: 'We grew up around flowers. Around jasmine. Around extraction.',
    highlight: 'It was home.',
    img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    tag: '2 HERITAGE',
    title: 'THE FIRST SPARK',
    body: 'Our father dedicated over four decades to natural floral extraction at Chennai Bio Flora.',
    img: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    tag: '3 DISCIPLINE',
    title: 'TWO BROTHERS',
    body: 'Sriram and Srinivas. Chemical engineers rethinking perfume from the molecule up.',
    img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    tag: '4 COLLABORATION',
    title: 'MET PRANAV',
    body: 'Lineage perfumery meets chemical engineering. Different worlds, same obsession.',
    img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    tag: '5 INTENT',
    title: 'WHY CHEM BROS?',
    body: 'We wanted fragrances that do not just smell expensive. They make you remember.',
    img: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 6,
    tag: '6 INTEGRATION',
    title: 'SOIL TO BOTTLE',
    body: 'Flowers from Tamil Nadu, extracted with science, given structure through chemistry.',
    img: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 7,
    tag: '7 NATURE',
    title: 'THE BEGINNING',
    body: 'Nature gives us the raw aromatic compounds and unyielding starting foundation.',
    img: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 8,
    tag: '8 SCIENCE',
    title: 'THE POSSIBILITIES',
    body: 'Science unlocks the structural molecular possibilities of volatile extracts.',
    img: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 9,
    tag: '9 PEOPLE',
    title: 'THE MEANING',
    body: 'People give it meaning. Skin-adaptive extrait that lives differently on everyone.',
    img: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 10,
    tag: '10 HORIZON',
    title: 'MADURAI TO WORLD',
    body: 'Rooted in heritage fields. Crafted with clean laboratory precision for the globe.',
    img: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=900&q=80',
  },
];

// Layout builder
function buildLayout(count: number, cols: number): number[][] {
  const rows: number[][] = [];
  let placed = 0;
  let r = 0;
  while (placed < count) {
    const row: number[] = new Array(cols).fill(-1);
    const a = (r * 2 + (r % 2)) % cols;
    row[a] = placed++;
    if (r % 3 === 0 && placed < count) {
      let b = (a + 2) % cols;
      if (b === a) b = (a + 1) % cols;
      row[b] = placed++;
    }
    rows.push(row);
    r++;
  }
  return rows;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const OurStoryHero: React.FC = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pinnedStageRef = useRef<HTMLDivElement | null>(null);
  const whitePanelRef = useRef<HTMLDivElement | null>(null);
  const innerWrapperRef = useRef<HTMLDivElement | null>(null);
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  const cardOffsetsRef = useRef<number[]>([]);
  const cardHeightsRef = useRef<number[]>([]);
  const lastRevealRef = useRef<number[]>([]);

  const [cols, setCols] = useState<number>(4);

  const gridRows = useMemo(() => buildLayout(STORY_ITEMS.length, cols), [cols]);

  useEffect(() => {
    const checkViewport = () => {
      const w = window.innerWidth;
      if (w < 640) setCols(2);
      else if (w < 1024) setCols(3);
      else setCols(4);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const stage = pinnedStageRef.current;
    const whitePanel = whitePanelRef.current;
    const innerWrapper = innerWrapperRef.current;
    if (!root || !stage || !whitePanel || !innerWrapper) return;

    const vh = window.innerHeight;
    const wrapHeight = innerWrapper.scrollHeight || 1600;
    const maxScroll = Math.max(vh, wrapHeight - vh);
    const totalScrollDist = vh + maxScroll + vh * 0.4;
    const totalContainerHeight = totalScrollDist + vh;

    root.style.height = `${totalContainerHeight}px`;

    const wrapperTopInPanel = innerWrapper.offsetTop;

    cardElementsRef.current.forEach((card, i) => {
      if (!card) return;
      cardOffsetsRef.current[i] = card.offsetTop;
      cardHeightsRef.current[i] = card.offsetHeight;
    });

    lastRevealRef.current = [];

    cardElementsRef.current.forEach((card) => {
      if (!card) return;
      gsap.set(card, { opacity: 0, y: 48, scale: 0.94 });
    });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        pin: stage,
        pinSpacing: false,
        invalidateOnRefresh: true,
        anticipatePin: 1,

        onEnter: () => {
          if (pinnedStageRef.current) pinnedStageRef.current.style.visibility = 'visible';
        },
        onLeave: () => {
          if (pinnedStageRef.current) pinnedStageRef.current.style.visibility = 'hidden';
        },
        onEnterBack: () => {
          if (pinnedStageRef.current) pinnedStageRef.current.style.visibility = 'visible';
        },
        onLeaveBack: () => {
          if (pinnedStageRef.current) pinnedStageRef.current.style.visibility = 'visible';
          if (whitePanelRef.current) gsap.set(whitePanelRef.current, { y: vh });
        },

        onUpdate: (self) => {
          if (self.progress <= 0) {
            gsap.set(whitePanel, { y: vh });
            return;
          }
          if (self.progress >= 1) {
            gsap.set(whitePanel, { y: 0 });
            gsap.set(innerWrapper, { y: -maxScroll });
            return;
          }

          const scroll = self.progress * totalScrollDist;

          if (scroll <= vh) {
            const panelOffset = Math.max(0, vh - scroll);
            gsap.set(whitePanel, { y: panelOffset });
            return;
          }

          gsap.set(whitePanel, { y: 0 });
          const galleryOffset = -(scroll - vh);
          gsap.set(innerWrapper, { y: galleryOffset });

          cardElementsRef.current.forEach((card, i) => {
            if (!card) return;

            const staticOffsetTop = cardOffsetsRef.current[i] ?? 0;
            const cardH = cardHeightsRef.current[i] ?? 300;

            const cardTop = wrapperTopInPanel + staticOffsetTop + galleryOffset;
            const cardBottom = cardTop + cardH;

            const enterProgress = clamp((vh * 0.92 - cardTop) / (vh * 0.38), 0, 1);
            const exitProgress = clamp(cardBottom / (vh * 0.12), 0, 1);
            const reveal = Math.min(enterProgress, exitProgress);

            if (
              lastRevealRef.current[i] !== undefined &&
              Math.abs(reveal - lastRevealRef.current[i]) < 0.005
            ) {
              return;
            }
            lastRevealRef.current[i] = reveal;

            gsap.set(card, {
              opacity: reveal,
              y: 48 * (1 - reveal),
              scale: 0.94 + 0.06 * reveal,
            });
          });
        },
      });

      ScrollTrigger.refresh();
    }, root);

    return () => {
      ctx.revert();
      if (pinnedStageRef.current) pinnedStageRef.current.style.visibility = 'visible';
    };
  }, [gridRows]);

  return (
    <section
      id="scroll-spacer"
      ref={rootRef}
      className="relative w-full select-none bg-white"
      style={{ minHeight: '100vh' }}
    >
      <div
        ref={pinnedStageRef}
        className="w-full h-screen relative overflow-hidden bg-transparent"
      >
        {/* PHASE 1: HERO */}
        <div className="absolute inset-0 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 z-0 overflow-hidden">
          <img
            src={DEFAULT_STORY_BG}
            alt="Chembros Heritage Background"
            className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
            draggable={false}
          />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="font-['Conquera',sans-serif] text-3xl sm:text-5xl lg:text-7xl font-normal text-black tracking-wider uppercase leading-[1.12]">
              Two Brothers. <br />
              <span className="italic font-light font-['FONTSPRING_DEMO_-_Pockota_Light','serif'] lowercase text-black/90">
                A Bigger Purpose.
              </span>
            </h1>
            <p className="mt-5 text-xs sm:text-sm lg:text-base text-black/75 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] max-w-xl mx-auto leading-relaxed">
              We are Sriram and Srinivas Ganesh, twin brothers and chemical engineers. With Chennai Bio Flora, we have built a vertically integrated ecosystem from flower fields to fine fragrances.
            </p>
          </div>
        </div>

        {/* PHASE 2: WHITE GALLERY */}
        <div
          ref={whitePanelRef}
          className="absolute inset-0 bg-[#F9F8F6] z-10 w-full h-full overflow-hidden shadow-[0_-25px_60px_rgba(0,0,0,0.06)] border-t border-black/10"
          style={{ transform: 'translateY(100vh)', willChange: 'transform' }}
        >
          <div
            ref={innerWrapperRef}
            className="w-full pt-[min(320px,35vh)] pb-[40vh] px-4 sm:px-8 lg:px-12"
            style={{ willChange: 'transform' }}
          >
            <div
              className={`grid gap-4 sm:gap-6 lg:gap-8 w-full max-w-7xl mx-auto ${
                cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4'
              }`}
            >
              {gridRows.map((row, rowIdx) =>
                row.map((itemIdx, colIdx) => {
                  // EMPTY SLOT INTERLUDE CARDS:
                  if (itemIdx === -1 || !STORY_ITEMS[itemIdx]) {
                    // Spot 1: Space before Card 3 (Row 1)
                    if (rowIdx === 1) {
                      return (
                        <div
                          key={`interlude-${rowIdx}-${colIdx}`}
                          className="w-full aspect-[2/3] flex flex-col justify-center items-start p-6 sm:p-8"
                        >
                          <span className="text-[10px] font-mono tracking-widest text-black/40 uppercase mb-2">
                            ARCHIVE NOTE // 01
                          </span>
                          <h4 className="text-base sm:text-lg font-normal font-['Conquera',sans-serif] uppercase tracking-wider text-black leading-snug">
                            CRAFTED FOR A WIDER WORLD
                          </h4>
                          <p className="mt-3 text-xs text-black/70 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-relaxed">
                            A vertically integrated ecosystem â€” from flower fields directly into molecular fine fragrances.
                          </p>
                        </div>
                      );
                    }

                    // Spot 2: Space beside Card 7 (Row 4)
                    if (rowIdx === 4) {
                      return (
                        <div
                          key={`interlude-${rowIdx}-${colIdx}`}
                          className="w-full aspect-[2/3] flex flex-col justify-center items-start p-6 sm:p-8"
                        >
                          <span className="text-[10px] font-mono tracking-widest text-black/40 uppercase mb-2">
                            ARCHIVE NOTE // 02
                          </span>
                          <h4 className="text-base sm:text-lg font-normal font-['Conquera',sans-serif] uppercase tracking-wider text-black leading-snug">
                            CONSCIOUS TOMORROW
                          </h4>
                          <p className="mt-3 text-xs text-black/70 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-relaxed">
                            Nature gives us the beginning. Science unlocks its possibilities. People give it meaning.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={`empty-${rowIdx}-${colIdx}`}
                        className="w-full aspect-[2/3] pointer-events-none"
                      />
                    );
                  }

                  const item = STORY_ITEMS[itemIdx];
                  const isLeftHalf = colIdx < cols / 2;
                  const transformOrigin = isLeftHalf ? 'right bottom' : 'left bottom';

                  return (
                    <div
                      key={`card-${itemIdx}`}
                      ref={(el) => {
                        cardElementsRef.current[itemIdx] = el;
                      }}
                      className="relative w-full aspect-[2/3] overflow-hidden bg-white shadow-xl rounded-[20px] sm:rounded-[28px] border border-black/10 flex flex-col justify-between group"
                      style={{
                        opacity: 0,
                        transformOrigin,
                        willChange: 'transform, opacity',
                      }}
                    >
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                        decoding="async"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40 flex flex-col justify-between p-4 sm:p-6 text-white pointer-events-none">
                        <div className="text-[9px] sm:text-[10px] font-mono tracking-widest text-white/80 uppercase">
                          {item.tag}
                        </div>

                        <div>
                          <h3 className="text-sm sm:text-base font-normal font-['Conquera',sans-serif] tracking-wider uppercase text-white leading-tight">
                            {item.title}
                          </h3>
                          <p className="mt-1.5 text-[11px] sm:text-xs text-white/85 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-snug line-clamp-3">
                            {item.body}
                          </p>
                          {item.highlight && (
                            <span className="mt-1.5 inline-block text-[11px] italic font-serif text-white/95 font-semibold">
                              "{item.highlight}"
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default OurStoryHero;