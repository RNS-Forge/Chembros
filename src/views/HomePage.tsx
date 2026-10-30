'use client'
import Homehero from '../components/Homehero'
import HomeProduct from '../components/HomeProduct'
import HomeCta from '../components/HomeCta'
import VideoArea from '../components/VideoArea'
import Footer from '../components/Footer'

export default function HomePage() {
    return (
        <div className="w-full flex flex-col items-center">
            <Homehero />
            <HomeProduct />
            <HomeCta />
            <VideoArea />
            <Footer />
        </div>
    )
}
