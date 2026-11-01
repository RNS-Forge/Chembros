import { Suspense } from 'react'
import DashboardPage from '@/views/DashboardPage'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <DashboardPage initialTab="overview" />
    </Suspense>
  )
}

