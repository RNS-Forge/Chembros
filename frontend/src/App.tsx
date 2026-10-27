import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import CartDrawer from './components/CartDrawer'
import AuthModal from './components/AuthModal'
import ProfileModal from './components/ProfileModal'

import HomePage from './pages/HomePage'
import Fragrances from './pages/Fragrances'
import ProductDetail from './pages/ProductDetail'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import MyOrdersPage from './pages/MyOrdersPage'
import AdminPage from './pages/AdminPage'
import OurStoryPage from './pages/OurStoryPage'
import AuthPage from './pages/AuthPage'
import SmoothScroll from './components/SmoothScroll'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <SmoothScroll>
            <div className="w-full min-h-screen bg-white text-black selection:bg-neutral-200 overflow-x-clip font-['Inter',sans-serif]">
              {/* Global Slide-out Bag & Auth & Profile Modals */}
              <CartDrawer />
              <AuthModal />
              <ProfileModal />

              {/* Application Routes */}
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/fragrances" element={<Fragrances />} />
                <Route path="/fragrances/:id" element={<ProductDetail />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
                <Route path="/my-orders" element={<MyOrdersPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/our-story" element={<OurStoryPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
              </Routes>
            </div>
          </SmoothScroll>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}
