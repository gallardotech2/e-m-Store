'use client'

import { usePathname } from 'next/navigation'
import { StoreFooter } from './store-footer'

export function FooterWrapper() {
  const pathname = usePathname()

  if (pathname.startsWith('/admin') || pathname.startsWith('/affiliate')) {
    return null
  }

  return <StoreFooter />
}
