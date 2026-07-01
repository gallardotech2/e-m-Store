'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, Users,
  ShoppingCart, Settings, Tags, Star, Image, Ellipsis,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Counts {
  orders: number
  affiliates: number
}

const primaryLinks = [
  { href: '/admin', icon: LayoutDashboard, label: 'Panel', countKey: undefined as keyof Counts | undefined },
  { href: '/admin/products', icon: Package, label: 'Prod', countKey: undefined },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Pedidos', countKey: 'orders' as const },
  { href: '/admin/affiliates', icon: Users, label: 'Afiliados', countKey: 'affiliates' as const },
  { href: '/admin/config', icon: Settings, label: 'Config', countKey: undefined },
]

const secondaryLinks = [
  { href: '/admin/categories', icon: Tags, label: 'Categorías' },
  { href: '/admin/featured', icon: Star, label: 'Destacados' },
  { href: '/admin/banners', icon: Image, label: 'Banners' },
]

export function AdminBottomNav({ counts = { orders: 0, affiliates: 0 } }: { counts?: Counts }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="bg-[#1a1a2e] text-white flex items-center h-14 border-t border-white/10 overflow-x-auto">
      {primaryLinks.map((link) => {
        const isActive = pathname === link.href
        const count = link.countKey ? counts[link.countKey] : 0
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] min-w-[52px] transition-all duration-200 shrink-0 ${
              isActive
                ? 'text-indigo-400 scale-110'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <div className="relative">
              <link.icon className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </div>
            <span className="font-medium">{link.label}</span>
          </Link>
        )
      })}

      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] min-w-[52px] shrink-0 text-white/50 hover:text-white/80 transition-all duration-200 cursor-pointer"
        >
          <Ellipsis className="h-5 w-5" />
          <span className="font-medium">Más</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="min-w-[180px] rounded-xl border border-white/10 bg-[#1a1a2e] text-white shadow-xl"
        >
          {secondaryLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <DropdownMenuItem
                key={link.href}
                onClick={() => router.push(link.href)}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer ${
                  isActive
                    ? 'text-indigo-400 font-medium bg-white/5'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {link.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
