import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'

export default function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-white text-black selection:bg-neutral-200 overflow-x-hidden">
        {/* Main Content Area */}
        <main className="w-full flex flex-col items-center">
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
