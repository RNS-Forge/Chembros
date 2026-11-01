import { Suspense } from 'react'
import Fragrances from '@/views/Fragrances'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <Fragrances />
    </Suspense>
  )
}
