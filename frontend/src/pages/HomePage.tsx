import Homehero from '../components/Homehero'
import HomeProduct from '../components/HomeProduct'

export default function HomePage() {
    return (
        <div className="w-full flex flex-col items-center">
            <Homehero />
            <HomeProduct />
        </div>
    )
}
