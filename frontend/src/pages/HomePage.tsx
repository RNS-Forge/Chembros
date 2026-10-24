import Homehero from '../components/Homehero'
import HomeProduct from '../components/HomeProduct'
import HomeCta from '../components/HomeCta'
import Footer from '../components/Footer'

export default function HomePage() {
    return (
        <div className="w-full flex flex-col items-center">
            <Homehero />
            <HomeProduct />
            <HomeCta />
            <Footer />
        </div>
    )
}
