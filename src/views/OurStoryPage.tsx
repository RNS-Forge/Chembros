'use client'
import NavBar from '../components/NavBar'
import OurStoryHero from '../components/OurStoryHero'
import Footer from '../components/Footer'

export default function OurStoryPage() {
  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col justify-between overflow-x-hidden selection:bg-neutral-800 selection:text-white">
      <NavBar />
      <main className="w-full flex-1">
        <OurStoryHero />
      </main>
      <Footer />
    </div>
  )
}

