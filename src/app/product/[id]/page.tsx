import { Suspense } from 'react'
import ProductDetail from '@/views/ProductDetail'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ProductDetail />
    </Suspense>
  )
}
