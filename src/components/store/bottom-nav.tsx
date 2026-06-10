'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Users, LayoutGrid } from 'lucide-react'
import { useSearchModal } from '@/hooks/use-search-modal'
import { useCategoriesModal } from '@/hooks/use-categories-modal'

export function BottomNav({ affiliateId }: { affiliateId?: string | null }) {
  const pathname = usePathname()
  const a = affiliateId ?? null
  const { openModal: openSearch } = useSearchModal()
  const { openModal: openCategories } = useCategoriesModal()

  const items = [
    { href: `/${a ? `?a=${a}` : ''}`, icon: Home, label: 'Inicio', match: pathname === '/' },
    { icon: LayoutGrid, label: 'Categorías', onClick: openCategories },
    { icon: Search, label: 'Buscar', onClick: openSearch },
    { href: `/auth/login`, icon: Users, label: 'Afiliados' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-4px_15px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          if ('onClick' in item) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center px-3 py-1 min-w-[60px] text-xs text-gray-500 transition-colors"
              >
                <item.icon className="h-6 w-6 mb-1" />
                <span>{item.label}</span>
              </button>
            )
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center px-3 py-1 min-w-[60px] text-xs transition-colors ${
                item.match !== undefined
                  ? item.match
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-500'
                  : pathname === item.href.split('?')[0]
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-500'
              }`}
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
