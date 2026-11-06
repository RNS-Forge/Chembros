import { Suspense } from 'react'
import FaqsPage from '@/views/FaqsPage'

export const metadata = {
  title: 'FAQs — Chembros Haute Parfumerie',
  description: 'Frequently asked questions regarding Chembros extrait de parfum formulations, ordering, hygiene controls, and courier dispatch protocols.',
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <FaqsPage />
    </Suspense>
  )
}

