import { Suspense } from 'react'
import OrderConfirmationPage from '@/views/OrderConfirmationPage'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <OrderConfirmationPage />
    </Suspense>
  )
}

