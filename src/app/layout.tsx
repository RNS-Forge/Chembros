import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'

export const metadata: Metadata = {
  title: 'CHEM BROS | Luxury Extrait de Parfum from India',
  description:
    'Discover CHEM BROS — a new expression of Indian fine perfumery. Explore distinctive extrait de parfum crafted through botanical heritage, natural extractions and modern chemistry.',
  keywords: [
    'CHEM BROS',
    'Luxury Perfumes',
    'Extrait de Parfum',
    'Indian Perfumery',
    'Fine Fragrances',
    'Botanical Perfumes',
    'Molecule J',
    'Molecule T',
    'Molecule R',
    'Molecule X',
  ],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'CHEM BROS | Luxury Fragrance, Reimagined',
    description:
      'Rooted in Madurai. Crafted for a wider world. Discover a new architecture of fine fragrance.',
    siteName: 'CHEM BROS',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Montserrat:ital,wght@0,300..900;1,300..900&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="beforeInteractive" />
      </head>
      <body suppressHydrationWarning>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
