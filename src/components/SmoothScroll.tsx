'use client'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import type { LenisRef } from 'lenis/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLocation } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

/**
 * Inner component to synchronize Lenis with GSAP ScrollTrigger and React Router
 */
function LenisSync() {
  const lenis = useLenis()
  const { pathname } = useLocation()

  // Sync Lenis with GSAP ScrollTrigger & GSAP Ticker
  useEffect(() => {
    if (!lenis) return

    // 1. Tell ScrollTrigger whenever Lenis updates scroll
    const handleScroll = () => {
      ScrollTrigger.update()
    }
    lenis.on('scroll', handleScroll)

    // 2. Drive Lenis through GSAP ticker for frame-perfect sync with ScrollTrigger
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', handleScroll)
      gsap.ticker.remove(tickerCallback)
    }
  }, [lenis])

  // Reset scroll to top and refresh ScrollTrigger on route navigation
  useEffect(() => {
    if (!lenis) return

    // Immediate jump to top when navigating to another route
    lenis.scrollTo(0, { immediate: true })

    // Allow DOM to settle, then refresh ScrollTrigger calculations
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 60)

    return () => clearTimeout(refreshTimer)
  }, [pathname, lenis])

  return null
}

interface SmoothScrollProps {
  children: ReactNode
}

/**
 * Global Lenis Smooth Scroll Provider for entire website
 * Configured with momentum inertia and GSAP ScrollTrigger integration
 */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<LenisRef>(null)

  return (
    <ReactLenis
      ref={lenisRef}
      root
      autoRaf={false}
      options={{
        lerp: 0.085, // Silky luxury momentum feeling (lower = smoother inertia, higher = tighter)
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false,
      }}
    >
      <LenisSync />
      {children}
    </ReactLenis>
  )
}
