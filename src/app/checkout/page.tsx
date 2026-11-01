import { Suspense } from 'react'
import CheckoutPage from '@/views/CheckoutPage'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CheckoutPage />
    </Suspense>
  )
}
