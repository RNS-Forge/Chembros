import { Suspense } from 'react'
import FaqsPage from '@/views/FaqsPage'

export const metadata = {
  title: 'FAQs | CHEM BROS — Luxury Fine Perfumery',
  description:
    'Find answers to common questions about CHEM BROS fragrances, extrait de parfum concentrations, ingredients, orders, payments, shipping, returns and product care.',
  keywords: [
    'CHEM BROS FAQs',
    'Perfume FAQs',
    'Extrait de Parfum',
    'Luxury Perfume Care',
    'Perfume Shipping and Returns',
    'Indian Fine Perfumery',
  ],
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <FaqsPage />
    </Suspense>
  )
}

