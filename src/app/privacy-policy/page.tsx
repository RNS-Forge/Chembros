import { Suspense } from 'react'
import PrivacyPolicy from '@/views/PrivacyPolicy'

export const metadata = {
  title: 'Privacy Policy | CHEM BROS — Luxury Fine Perfumery',
  description:
    'Learn how CHEM BROS collects, uses, protects and manages your personal information, including customer data, order details, payment privacy and website security.',
  keywords: [
    'CHEM BROS Privacy Policy',
    'Customer Data Protection',
    'Personal Information Privacy',
    'Online Perfume Store Privacy',
    'Data Security',
  ],
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PrivacyPolicy />
    </Suspense>
  )
}

