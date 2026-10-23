import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import CartDrawer from './components/CartDrawer'
import AuthModal from './components/AuthModal'

import HomePage from './pages/HomePage'
import FragrancesPage from './pages/FragrancesPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import MyOrdersPage from './pages/MyOrdersPage'
import AdminPage from './pages/AdminPage'
import OurStoryPage from './pages/OurStoryPage'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="w-full min-h-screen bg-white text-black selection:bg-neutral-200 overflow-x-hidden font-['Inter',sans-serif]">
            {/* Slide-out Cart Drawer and Global Auth Modal */}
            <CartDrawer />
            <AuthModal />

            {/* Application Routes */}
            <main className="w-full flex flex-col items-center">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/fragrances" element={<FragrancesPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="/my-orders" element={<MyOrdersPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/our-story" element={<OurStoryPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}
