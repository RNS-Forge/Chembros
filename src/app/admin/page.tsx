import { Suspense } from 'react'
import AdminPage from '@/views/AdminPage'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AdminPage />
    </Suspense>
  )
}
