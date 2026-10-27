import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Fragrances from './pages/Fragrances'
import ProductDetail from './pages/ProductDetail'
import SmoothScroll from './components/SmoothScroll'

export default function App() {
  return (
    <Router>
      <SmoothScroll>
        <div className="w-full min-h-screen bg-white text-black selection:bg-neutral-200 overflow-x-clip">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/fragrances" element={<Fragrances />} />
            <Route path="/fragrances/:id" element={<ProductDetail />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </div>
      </SmoothScroll>
    </Router>
  )
}
