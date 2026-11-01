'use client'
import Homehero from '../components/Homehero'
import HomeProduct from '../components/HomeProduct'
import HomeCta from '../components/HomeCta'
import VideoArea from '../components/VideoArea'
import Footer from '../components/Footer'
import { usePlatformSettings } from '../context/PlatformSettingsContext'

export default function HomePage() {
  const { settings } = usePlatformSettings()

  return (
    <div className="w-full flex flex-col items-center">
      {settings.maintenance_mode && (
        <div className="w-full bg-[#4a2e70] text-white py-2 px-4 text-center text-[11px] font-mono tracking-widest uppercase border-b border-[#3b245e]">
          Atelier Private Tasting Mode Active · Formulations Curated for Direct Studio Delivery
        </div>
      )}
      <Homehero />
      <HomeProduct />
      <HomeCta />
      {settings.enable_video_stories && <VideoArea />}
      <Footer />
    </div>
  )
}
