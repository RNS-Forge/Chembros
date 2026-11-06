import { Suspense } from 'react'
import PrivacyPolicy from '@/views/PrivacyPolicy'

export const metadata = {
  title: 'Privacy Policy — Chembros Haute Parfumerie',
  description: 'Legal protocols, data governance, and discretion policies governing your orders at Chembros.',
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PrivacyPolicy />
    </Suspense>
  )
}

