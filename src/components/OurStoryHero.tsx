'use client'
import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { StaticImageData } from 'next/image';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Herobg from '../assets/footerbg.png';
import bottleImg from '../assets/bottle.png';
import { ArrowRight, Flower2, Atom, Droplets } from 'lucide-react';
import Image1 from '../assets/ourstory/1.jpg';
import Image2 from '../assets/ourstory/pranav.jpg';
import Image3 from '../assets/ourstory/3.webp';
import Image4 from '../assets/ourstory/4.webp';
import Image5 from '../assets/ourstory/5.webp';
import Botanical from '../assets/ourstory/botanical.jpg';
import Research from '../assets/ourstory/research.jpg';
import provenanceRaw from '../assets/bg/ctabg2.webp';
import Chemistry from '../assets/product/J/J2.png'
import Method from '../assets/product/tetra/t2.png'
import Ten from '../assets/product/T/T2.png'

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_STORY_BG = (Herobg as any)?.src || Herobg;
const defaultBottle = (bottleImg as any)?.src || bottleImg;
const provenanceSrc = (provenanceRaw as any)?.src || provenanceRaw;

interface StoryCardItem {
  id: number;
  tag: string;
  title: string;
  body: string;
  img: string | StaticImageData;
}

const STORY_ITEMS: StoryCardItem[] = [
  {
    id: 1,
    tag: '01 THE BEGINNING',
    title: 'WHERE IT BEGAN',
    body: 'In 2024, our journey began in Kannauj, Indias fragrance capital, where an unexpected meeting would shape the future of fine perfumery.',
    img: Image1,
  },
  {
    id: 2,
    tag: '02 HERITAGE',
    title: 'EIGHT GENERATIONS OF KNOWLEDGE',
    body: 'We crossed paths with Pranav Kapoor, an eighth-generation perfumer carrying generations of ancestral knowledge and an instinctive understanding of fragrance.',
    img: Image2,
  },
  {
    id: 3,
    tag: '03 DISCIPLINE',
    title: 'TWO BROTHERS',
    body: 'Our background in chemical engineering brought a scientific perspective to the centuries-old art of perfumery.',
    img: Image3,
  },
  {
    id: 4,
    tag: '04 THE ENCOUNTER',
    title: 'MEETING PRANAV',
    body: 'When modern chemical engineering met Pranavs ancestral intuition, two different worlds of fragrance came together to imagine something entirely new.',
    img: Image4,
  },
  {
    id: 5,
    tag: '06 RESEARCH',
    title: 'TWO YEARS OF EXPLORATION',
    body: 'What began as an ambitious vision became two years of intensive research, experimentation and a deeper exploration of fragrance at the molecular level.',
    img: Research,
  },
  {
    id: 6,
    tag: '05 THE VISION',
    title: 'A NEW OLFACTIVE ARCHITECTURE',
    body: 'Together, we envisioned a new way of approaching fine fragrance, bringing together ancestral perfumery and the precision of chemical engineering.',
    img: Image5,
  },
  {
    id: 7,
    tag: '07 BOTANICALS',
    title: 'THE PURITY OF NATURE',
    body: 'Pure botanical extractions became a central part of our journey, exploring the natural foundations that shape the character of fine fragrance.',
    img: Botanical,
  },
  {
    id: 8,
    tag: '08 CHEMISTRY',
    title: 'BEYOND THE FIRST IMPRESSION',
    body: 'We explored fragrance at a molecular level, studying how science and botanical ingredients could come together to create a new olfactive architecture.',
    img: Chemistry,
  },
  {
    id: 9,
    tag: '09 METHODOLOGY',
    title: 'A UNIFIED APPROACH',
    body: 'Two years of research, molecular exploration and botanical extraction came together to form a unified methodology for creating fine fragrance.',
    img: Method,
  },
  {
    id: 10,
    tag: '10 THE MANIFESTATION',
    title: 'FROM VISION TO REALITY',
    body: 'In 2026, we proudly introduce a redefined architecture of fine fragrance, engineered by us and crafted by Pranav.',
    img: Ten,
  },
];

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
    const wrapperTopInPanel = innerWrapper.offsetTop;

    // Measure every card's exact position and find the true bottom of the last card
    let maxCardBottom = 0;
    cardElementsRef.current.forEach((card, i) => {
      if (!card) return;
      const top = card.offsetTop;
      const height = card.offsetHeight;
      cardOffsetsRef.current[i] = top;
      cardHeightsRef.current[i] = height;
      if (top + height > maxCardBottom) {
        maxCardBottom = top + height;
      }
    });

    // Exact scroll distance so the bottom of the last card sits 24px above the bottom of the screen
    const exactContentHeight =
      maxCardBottom > 0 ? wrapperTopInPanel + maxCardBottom + 24 : innerWrapper.scrollHeight;
    const galleryScrollDist = Math.max(0, exactContentHeight - vh);
    const panelSlideDist = vh;
    const totalScrollDist = panelSlideDist + galleryScrollDist;

    root.style.height = `${totalScrollDist + vh}px`;

    lastRevealRef.current = [];

    cardElementsRef.current.forEach((card) => {
      if (!card) return;
      gsap.set(card, { opacity: 0, y: 45, scale: 0.94 });
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

        onUpdate: (self) => {
          if (self.progress <= 0) {
            gsap.set(whitePanel, { y: vh });
            return;
          }
          if (self.progress >= 1) {
            gsap.set(whitePanel, { y: 0 });
            gsap.set(innerWrapper, { y: -galleryScrollDist });
            cardElementsRef.current.forEach((card) => {
              if (card) gsap.set(card, { opacity: 1, y: 0, scale: 1 });
            });
            return;
          }

          const scroll = self.progress * totalScrollDist;

          // 1. Initial panel slide up over hero
          if (scroll <= panelSlideDist) {
            const panelOffset = Math.max(0, panelSlideDist - scroll);
            gsap.set(whitePanel, { y: panelOffset });
            gsap.set(innerWrapper, { y: 0 });
            return;
          }

          // 2. White panel is fully covering, animate gallery translation
          gsap.set(whitePanel, { y: 0 });
          const galleryOffset = -(scroll - panelSlideDist);
          gsap.set(innerWrapper, { y: galleryOffset });

          // 3. Smooth progressive reveal
          cardElementsRef.current.forEach((card, i) => {
            if (!card) return;

            const staticOffsetTop = cardOffsetsRef.current[i] ?? 0;
            const cardTop = wrapperTopInPanel + staticOffsetTop + galleryOffset;

            const enterProgress = clamp((vh * 0.92 - cardTop) / (vh * 0.36), 0, 1);

            if (
              lastRevealRef.current[i] !== undefined &&
              Math.abs(enterProgress - lastRevealRef.current[i]) < 0.005
            ) {
              return;
            }
            lastRevealRef.current[i] = enterProgress;

            gsap.set(card, {
              opacity: enterProgress,
              y: 45 * (1 - enterProgress),
              scale: 0.94 + 0.06 * enterProgress,
            });
          });
        },
      });

      ScrollTrigger.refresh();
    }, root);

    return () => {
      ctx.revert();
    };
  }, [gridRows]);

  return (
    <div className="w-full bg-white text-black">
      {/* =========================================================================
          SECTION 1: GSAP PINNED HERO + SLIDING WHITE GALLERY
          ========================================================================= */}
      <section
        id="scroll-spacer"
        ref={rootRef}
        className="relative w-full select-none bg-white"
        style={{ minHeight: '100vh' }}
      >
        <div
          ref={pinnedStageRef}
          className="w-full h-screen relative overflow-hidden bg-white"
        >
          {/* PHASE 1: HERO */}
          <div className="absolute inset-0 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 z-0 overflow-hidden bg-white">
            <img
              src={DEFAULT_STORY_BG}
              alt="Chembros Heritage Background"
              className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
              draggable={false}
            />

            <div className="max-w-4xl mx-auto text-center relative z-10">
              <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.3em] uppercase text-black/50 mb-2.5 sm:mb-3 block">
                CHEMBROS HERITAGE ARCHIVE
              </span>
              <h1 className="font-['Montserrat',sans-serif] text-2xl sm:text-5xl lg:text-7xl font-normal text-black tracking-wider uppercase leading-[1.12]">
                Two Brothers. <br />
                <span className="italic font-light font-['FONTSPRING_DEMO_-_Pockota_Light','serif'] lowercase text-black/90">
                  a bigger purpose.
                </span>
              </h1>
              <p className="mt-4 sm:mt-5 text-[11px] sm:text-sm lg:text-base text-black/75 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] max-w-xl mx-auto leading-relaxed">
                We are Sriram and Srinivas Ganesh, twin brothers and chemical engineers. In partnership with Chennai Bio Flora, we have engineered an integrated olfactory journey from flower fields to fine extraits.
              </p>
            </div>
          </div>

          {/* PHASE 2: WHITE GALLERY */}
          <div
            ref={whitePanelRef}
            className="absolute inset-0 bg-white z-10 w-full h-full overflow-hidden shadow-[0_-25px_60px_rgba(0,0,0,0.06)] border-t border-black/5"
            style={{ transform: 'translateY(100vh)', willChange: 'transform' }}
          >
            <div
              ref={innerWrapperRef}
              className="w-full pt-[min(120px,15vh)] sm:pt-[min(260px,28vh)] pb-6 sm:pb-16 px-3.5 sm:px-6 md:px-8 lg:px-10 xl:px-12 bg-white"
              style={{ willChange: 'transform' }}
            >
              <div
                className={`grid gap-3.5 sm:gap-7 lg:gap-8 w-full max-w-[1583px] mx-auto ${
                  cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4'
                }`}
              >
                {gridRows.map((row, rowIdx) =>
                  row.map((itemIdx, colIdx) => {
                    // =========================================================================
                    // 1. ORIGINAL QUOTE 01 (Row 1)
                    // =========================================================================
                    if (rowIdx === 1) {
                      if (colIdx === 0) {
                        return (
                          <div
                            key="quote-span-01"
                            className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col justify-center items-start p-3 sm:p-10 lg:p-14"
                          >
                            <blockquote className="font-['FONTSPRING_DEMO_-_Pockota_Light','serif'] text-[13px] sm:text-2xl lg:text-3xl xl:text-4xl italic text-black/90 leading-relaxed sm:leading-snug">
                              “We didn’t set out to make another perfume brand. We set out to prove that Indian chemical engineering and pure botanical extraction can redefine global fine perfumery.”
                            </blockquote>
                            <p className="mt-2.5 sm:mt-4 text-[9px] sm:text-xs font-mono tracking-wider sm:tracking-widest uppercase text-black/50">
                              — Sriram &amp; Srinivas Ganesh, Chemical Engineers
                            </p>
                          </div>
                        );
                      }
                      if (colIdx < cols - 1) return null;
                    }

                    // =========================================================================
                    // 2. NEW QUOTE: NEAR CARD 04 (MEETING PRANAV)
                    // =========================================================================
                    const hasMeetingPranav = row.includes(3);
                    if (hasMeetingPranav && itemIdx === -1) {
                      const firstEmptyCol = row.indexOf(-1);
                      if (colIdx === firstEmptyCol) {
                        return (
                          <div
                            key="quote-span-pranav"
                            className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col justify-center items-start p-3 sm:p-10 lg:p-14"
                          >
                            <blockquote className="font-['FONTSPRING_DEMO_-_Pockota_Light','serif'] text-[13px] sm:text-2xl lg:text-3xl xl:text-4xl italic text-black/90 leading-relaxed sm:leading-snug">
                              “When modern chemical engineering met Pranav Kapoor’s ancestral intuition, two different worlds of fragrance came together to imagine something entirely new.”
                            </blockquote>
                            <p className="mt-2.5 sm:mt-4 text-[9px] sm:text-xs font-mono tracking-wider sm:tracking-widest uppercase text-black/50">
                              — Kannauj Exploration, 2024
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }

                    // =========================================================================
                    // 3. ORIGINAL QUOTE 02 (Row 4, Near Card 07)
                    // =========================================================================
                    const hasCard07 = row.includes(6);
                    if (hasCard07 && itemIdx === -1) {
                      const firstEmptyIdx = row.indexOf(-1);
                      if (colIdx === firstEmptyIdx) {
                        return (
                          <div
                            key="quote-span-02"
                            className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col justify-center items-start p-3 sm:p-10 lg:p-14"
                          >
                            <span className="text-[8px] sm:text-[10px] font-mono tracking-[0.25em] sm:tracking-[0.3em] uppercase text-black/40 mb-2 sm:mb-3">
                              EXTRACTION PRINCIPLE 
                            </span>
                            <blockquote className="font-['FONTSPRING_DEMO_-_Pockota_Light','serif'] text-[13px] sm:text-2xl lg:text-3xl xl:text-4xl italic text-black/90 leading-relaxed sm:leading-snug">
                              “Nature provides the starting volatile compound. Science unlocks its longevity. Skin heat provides the final meaning.”
                            </blockquote>
                            <p className="mt-2.5 sm:mt-4 text-[9px] sm:text-xs font-mono tracking-wider sm:tracking-widest uppercase text-black/50">
                              — Chennai Bio Flora Synthesis Laboratory
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }

                    // =========================================================================
                    // 4. NEW QUOTE: NEAR CARD 08 (08 CHEMISTRY)
                    // =========================================================================
                    const hasChemistryCard = row.includes(7);
                    if (hasChemistryCard && itemIdx === -1) {
                      if (colIdx === 0) {
                        return (
                          <div
                            key="quote-span-chemistry"
                            className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col justify-center items-start p-3 sm:p-10 lg:p-14"
                          >
                            <span className="text-[8px] sm:text-[10px] font-mono tracking-[0.25em] sm:tracking-[0.3em] uppercase text-black/40 mb-2 sm:mb-3">
                              MOLECULAR ARCHITECTURE
                            </span>
                            <blockquote className="font-['FONTSPRING_DEMO_-_Pockota_Light','serif'] text-[13px] sm:text-2xl lg:text-3xl xl:text-4xl italic text-black/90 leading-relaxed sm:leading-snug">
                              “We explored fragrance at a molecular level, studying how science and botanical ingredients could come together to create a new olfactive architecture.”
                            </blockquote>
                            <p className="mt-2.5 sm:mt-4 text-[9px] sm:text-xs font-mono tracking-wider sm:tracking-widest uppercase text-black/50">
                              — Sriram &amp; Srinivas Ganesh, Chemical Engineers
                            </p>
                          </div>
                        );
                      }
                      if (colIdx < cols - 1) return null;
                    }

                    // Empty Plinth Slot
                    if (itemIdx === -1 || !STORY_ITEMS[itemIdx]) {
                      return (
                        <div
                          key={`empty-${rowIdx}-${colIdx}`}
                          className="w-full aspect-[3/4.6] pointer-events-none"
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
                        className="relative w-full aspect-[3/4.6] overflow-hidden bg-white shadow-xl rounded-[20px] sm:rounded-[34px] border border-black/10 flex flex-col justify-between group"
                        style={{
                          opacity: 0,
                          transformOrigin,
                          willChange: 'transform, opacity',
                        }}
                      >
                        <img
                          src={typeof item.img === 'string' ? item.img : (item.img as any)?.src || item.img}
                          alt={item.title}
                          className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-700 ease-out"
                          loading="lazy"
                          decoding="async"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/30 flex flex-col justify-between p-3.5 sm:p-7 text-white pointer-events-none">
                          <div className="text-[8px] sm:text-[10px] font-mono tracking-widest text-white/80 uppercase">
                            {item.tag}
                          </div>

                          <div>
                            <h3 className="text-[11px] sm:text-lg font-normal font-['Montserrat',sans-serif] tracking-wider uppercase text-white leading-tight">
                              {item.title}
                            </h3>
                            <p className="mt-1.5 sm:mt-2 text-[9.5px] sm:text-xs text-white/85 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-snug sm:leading-relaxed line-clamp-4">
                              {item.body}
                            </p>
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

      {/* =========================================================================
          SECTION 2: COMPLETE STORY DOSSIER (CONNECTS FLUSH WITH NO GAP)
          ========================================================================= */}
      <div className="w-full relative z-20 bg-white border-t border-black/5 pt-8 sm:pt-24 pb-16 sm:pb-24 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex flex-col items-center">
        <div className="w-full max-w-[1583px] flex flex-col items-center gap-12 sm:gap-24">

          {/* Part A: The Three Pillars */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            <div className="bg-white border border-black/10 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-5 sm:space-y-6">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black">
                <Flower2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-black/50 uppercase">PILLAR 01</span>
                <h3 className="font-['Montserrat',sans-serif] text-base sm:text-lg uppercase tracking-wider text-black">
                  Botanical Lineage
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-relaxed">
                  Supported by four decades of botanical floral extraction at Chennai Bio Flora. We work directly with southern agricultural sources to obtain pure organic absolutes.
                </p>
              </div>
            </div>

            <div className="bg-white border border-black/10 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-5 sm:space-y-6">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black">
                <Atom className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-black/50 uppercase">PILLAR 02</span>
                <h3 className="font-['Montserrat',sans-serif] text-base sm:text-lg uppercase tracking-wider text-black">
                  Molecular Isolation
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-relaxed">
                  Chemical engineering provides molecular stability. We isolate scent accords and bond them so volatile natural notes do not degrade over time.
                </p>
              </div>
            </div>

            <div className="bg-white border border-black/10 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-5 sm:space-y-6">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black">
                <Droplets className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-black/50 uppercase">PILLAR 03</span>
                <h3 className="font-['Montserrat',sans-serif] text-base sm:text-lg uppercase tracking-wider text-black">
                  Extrait Concentration
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-relaxed">
                  We formulate exclusively in pure Extrait de Parfum at a high 25% fragrance oil load, ensuring an enduring 8 to 12 hour projection on skin.
                </p>
              </div>
            </div>
          </div>

          {/* Part B: Provenance Sequence */}
          <div className="w-full relative rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] overflow-hidden border border-black/10 shadow-xs p-6 sm:p-10 lg:p-14 xl:p-16 min-h-[420px] sm:min-h-[500px] lg:min-h-[540px] flex items-center justify-start">
            <img
              src={provenanceSrc}
              alt="Chembros Extraction & Flacon Craftsmanship"
              className="absolute inset-0 w-full h-full object-cover object-[75%_center] sm:object-[68%_center] lg:object-center select-none pointer-events-none"
              draggable={false}
            />

            <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/60 to-transparent sm:w-[65%] lg:w-[55%] pointer-events-none" />

            <div className="relative z-10 max-w-lg sm:max-w-md lg:max-w-lg space-y-3.5 sm:space-y-5 text-left">
              <h2 className="font-['Montserrat',sans-serif] text-xl sm:text-3xl lg:text-4xl font-semibold uppercase tracking-tight text-black leading-[1.08]">
                From Southern Flora to Global Extraits
              </h2>

              <p className="text-[11px] sm:text-[13px] text-neutral-700 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-relaxed max-w-sm sm:max-w-none">
                Most luxury perfume labels license third-party formulas and re-bottle them. Chembros controls the entire synthesis chain: botanical cultivation, laboratory fractional separation, maturation, and climate-controlled packaging in Madurai.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-[9px] sm:text-[11px] font-mono tracking-wider text-black/85 uppercase font-medium">
                <span className="px-2.5 py-1 rounded-full bg-black/5 border border-black/10">01 HARVEST</span>
                <span className="text-black/40">&rarr;</span>
                <span className="px-2.5 py-1 rounded-full bg-black/5 border border-black/10">02 FRACTIONATE</span>
                <span className="text-black/40">&rarr;</span>
                <span className="px-2.5 py-1 rounded-full bg-black/5 border border-black/10">03 BOTTLE</span>
              </div>
            </div>
          </div>

          {/* Part C: Founders Statement & Collection CTA */}
          <div className="text-center max-w-2xl space-y-5 sm:space-y-6">
            <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] sm:tracking-[0.3em] text-black/40">
              SRIRAM GANESH AND SRINIVAS GANESH - Founders 
            </div>
            <p className="font-['FONTSPRING_DEMO_-_Pockota_Light','serif'] text-lg sm:text-3xl italic text-black/90 leading-snug">
              We set out to demonstrate that Indian chemical engineering and botanical mastery can set a new standard in global fine perfumery.
            </p>
            <div className="pt-2 sm:pt-3">
              <Link
                to="/fragrances"
                className="inline-flex items-center gap-2.5 px-7 sm:px-8 py-3 sm:py-3.5 bg-black hover:bg-neutral-800 active:scale-95 text-white rounded-full text-[11px] sm:text-xs font-medium uppercase tracking-[0.2em] shadow-lg transition-all font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]"
              >
                <span>Experience The Fragrances</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OurStoryHero;