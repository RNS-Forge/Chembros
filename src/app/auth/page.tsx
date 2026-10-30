import { Suspense } from 'react'
import AuthPage from '@/views/AuthPage'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AuthPage />
    </Suspense>
  )
}

