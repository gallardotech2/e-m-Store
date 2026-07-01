import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { FooterWrapper } from '@/components/store/footer-wrapper'

const roboto = Roboto({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto',
})

const raw = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const siteUrl = raw.startsWith('http') ? raw : `https://${raw}`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'e-m Store — Perfiles de streaming legales en Bolivia',
    template: '%s | e-m Store',
  },
  description:
    'Descubre cómo tener tu perfil exclusivo de streaming pagando desde 30 bolivianos. Acceso único con PIN personal, calidad 4K, 100% legal. Ahorra más del 60%.',
  openGraph: {
    title: 'e-m Store — Perfiles de streaming legales en Bolivia',
    description:
      'Descubre cómo tener tu perfil exclusivo de streaming pagando desde 30 bolivianos. Acceso único con PIN, calidad 4K, 100% legal. Ahorra más del 60%.',
    siteName: 'e-m store',
    locale: 'es_BO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'e-m Store — Perfiles de streaming legales en Bolivia',
    description:
      'Perfiles individuales de streaming desde 30 Bs. Ahorra más del 60%. Acceso exclusivo con PIN.',
  },
  icons: {
    icon: '/favicon.ico',
  },
  other: {
    'theme-color': '#1a1a2e',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${roboto.variable} font-sans h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        {children}
        <FooterWrapper />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
