import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import heroImg from '../assets/hero.png'
import bottleImg from '../assets/bottle.png'
import NavBar from './NavBar'
import { getProductsApi } from '../services/api'
import type { Product } from '../types'

export default function Homehero() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  useEffect(() => {
    async function loadFormulas() {
      try {
        const data = await getProductsApi()
        const formulas = data
          .filter((p) => !p.is_archive)
          .sort((a, b) => (a.code || '').localeCompare(b.code || '') || (Number(a.id) - Number(b.id)))
        setProducts(formulas)
      } catch (err) {
        console.error('Failed to load formulas for hero from live DB:', err)
      }
    }
    loadFormulas()
  }, [])

  const selectedProduct = products[selectedIndex] || products[0]

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
        {/* Floating Navigation Pill */}
        <div className="left-[172px] top-[48px] absolute z-50">
          <NavBar />
        </div>

        {/* Top Laboratory Blueprint Tagline */}
        <div className="left-[172px] top-[148px] absolute z-30 flex items-center gap-3 text-black/50 font-mono text-xs tracking-[0.3em] uppercase">
          <span className="w-2 h-2 rounded-full bg-black/80 animate-pulse" />
          <span>RESEARCH & EXTRACTION ARCHIVE // 2026 EDITION</span>
        </div>

        {/* Big Editorial Headline */}
        <div className="left-[172px] top-[185px] absolute z-30 pointer-events-none">
          <h1 className="text-black text-[54px] font-normal font-['Conquera',sans-serif] leading-[62px] tracking-wider uppercase">
            CHEMISTRY <br />
            CAPTURED
          </h1>
        </div>

        <div className="right-[172px] top-[185px] absolute z-30 pointer-events-none text-right">
          <h2 className="text-black text-[54px] font-normal font-['Conquera',sans-serif] leading-[62px] tracking-wider uppercase">
            IN A <br />
            BOTTLE.
          </h2>
        </div>

        {/* Central Model Canvas */}
        <div className="w-[1576px] h-[983px] left-[172px] top-0 absolute overflow-hidden pointer-events-none">
          <img
            className="w-[1414px] h-[1050px] left-1/2 -translate-x-[48%] top-0 absolute object-cover object-top select-none pointer-events-none"
            src={heroImg}
            alt="Chembros Hero Model"
            draggable={false}
          />
        </div>

        {/* HERO SHOWCASE BOTTLE */}
        <div className="left-[1060px] top-[370px] absolute z-30 flex flex-col items-center group pointer-events-auto">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/40 blur-[60px] rounded-full -z-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

          <div className="relative">
            <img
              className="w-[340px] h-[380px] object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.22)] group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-700 ease-out select-none"
              src={selectedProduct?.image_base64 || bottleImg}
              alt="Chembros Flagship Perfume Bottle"
              draggable={false}
            />

            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[10px] font-mono tracking-widest px-3 py-1 rounded-full border border-white/20 whitespace-nowrap shadow-lg">
              {selectedProduct ? `${selectedProduct.name} · ${selectedProduct.concentration || '30% Extrait'}` : 'MOLECULE X · 32% Extrait'}
            </div>
          </div>
        </div>

        {/* Interactive Batch Selector */}
        <div className="left-[172px] bottom-[50px] absolute z-30 flex items-end gap-10">
          
          {/* Formula Card */}
          <div className="w-[420px] p-6 bg-white/85 backdrop-blur-xl border border-black/10 rounded-[32px] shadow-[0_15px_35px_rgba(0,0,0,0.06)] flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-black/50 uppercase">
              <span className="flex items-center gap-1.5 text-black">
                <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
                ACTIVE FORMULATION
              </span>
              <span>BATCH // {selectedProduct?.code || '01'}</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-normal font-['Conquera',sans-serif] tracking-wider text-black uppercase">
                {selectedProduct?.name || 'MOLECULE X'}
              </div>
              <span className="text-sm font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-black/60">
                {selectedProduct ? `₹${selectedProduct.price.toLocaleString('en-IN')}` : '₹1,299'}
              </span>
            </div>

            <p className="text-xs text-black/60 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] tracking-wide">
              {selectedProduct?.subtitle || 'Santal · Iso E Super · Cardamom'}
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-black/5">
              <span className="text-[10px] font-mono text-black/40 uppercase">
                {selectedProduct?.volume_ml ? `${selectedProduct.volume_ml}ML EXTRAIT DE PARFUM` : '30ML EXTRAIT DE PARFUM'}
              </span>
              <Link
                to={`/fragrances/${selectedProduct?.slug || selectedProduct?.id || 'molecule-x'}`}
                className="text-xs font-semibold uppercase tracking-wider text-black flex items-center gap-1 hover:opacity-70 transition-opacity"
              >
                <span>Inspect Formula</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Formula Switcher Pills */}
          <div className="flex items-center gap-3">
            {products.map((formula, idx) => {
              const isActive = selectedIndex === idx
              return (
                <button
                  key={formula.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-5 py-3 rounded-2xl border text-xs font-mono tracking-wider transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-black text-white border-black shadow-lg scale-105'
                      : 'bg-white/90 backdrop-blur-md text-black/70 border-black/10 hover:border-black/40 hover:bg-white'
                  }`}
                >
                  <span className="text-[10px] opacity-50 block text-left">F-{formula.code || `0${idx + 1}`}</span>
                  <span className="font-semibold uppercase">{formula.name.replace('MOLECULE ', 'M-')}</span>
                </button>
              )
            })}
          </div>

        </div>

        {/* Low-Profile Bottom Edge Blend */}
        <div 
          className="w-full h-24 absolute left-0 bottom-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to top, #ffffff 0%, rgba(255, 255, 255, 0.9) 25%, rgba(255, 255, 255, 0.4) 55%, transparent 100%)',
          }}
        />
      </div>
    </section>
  )
}