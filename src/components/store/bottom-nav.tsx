'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Home, Search, Grid3X3, Users, ShoppingBag } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const a = searchParams.get('a')

  const items = [
    { href: `/${a ? `?a=${a}` : ''}`, icon: Home, label: 'Inicio', match: pathname === '/' && !searchParams.get('cat') && !searchParams.get('buscar') },
    { href: `/#productos${a ? `?a=${a}` : ''}`, icon: ShoppingBag, label: 'Productos' },
    { href: `/buscar${a ? `?a=${a}` : ''}`, icon: Search, label: 'Buscar' },
    { href: `/auth/login`, icon: Users, label: 'Afiliados' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-4px_15px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center px-3 py-1 min-w-[60px] text-xs transition-colors ${
              item.match !== undefined
                ? item.match
                  ? 'text-red-600'
                  : 'text-gray-500'
                : pathname === item.href.split('?')[0]
                  ? 'text-red-600'
                  : 'text-gray-500'
            }`}
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
