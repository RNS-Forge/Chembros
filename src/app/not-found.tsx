'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center select-none font-['Inter',sans-serif] px-6 text-center">
      <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-black/40 block mb-4">
        404 · PAGE NOT FOUND
      </span>
      <h1 className="text-5xl sm:text-7xl font-semibold font-['Montserrat',sans-serif] tracking-tight uppercase text-black leading-none mb-4">
        Lost Molecule
      </h1>
      <p className="text-xs sm:text-sm text-neutral-500 font-['Poppins',sans-serif] leading-relaxed max-w-sm mb-10">
        The page you're looking for has evaporated. Return to the archive and explore our extrait collection.
      </p>
      <Link
        href="/"
        className="px-7 py-3 rounded-full bg-black text-white text-xs font-mono uppercase tracking-widest font-semibold hover:bg-neutral-800 active:scale-95 transition-all"
      >
        Return Home
      </Link>
    </div>
  )
}

