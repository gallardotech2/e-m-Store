import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const roboto = Roboto({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: 'E-M Store - Tu Tienda Online en Bolivia',
  description: 'Lo quieres, lo tienes · Envíos a todo Bolivia',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${roboto.variable} font-sans h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
