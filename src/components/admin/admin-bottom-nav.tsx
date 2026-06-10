'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Tags, Star, Image, Users,
  ShoppingCart, Settings,
} from 'lucide-react'

const links = [
  { href: '/admin', icon: LayoutDashboard, label: 'Panel' },
  { href: '/admin/products', icon: Package, label: 'Productos' },
  { href: '/admin/categories', icon: Tags, label: 'Cats' },
  { href: '/admin/featured', icon: Star, label: 'Dest' },
  { href: '/admin/banners', icon: Image, label: 'Banners' },
  { href: '/admin/affiliates', icon: Users, label: 'Afiliados' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Pedidos' },
  { href: '/admin/config', icon: Settings, label: 'Config' },
]

export function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-[#1a1a2e] text-white flex items-center h-14 border-t border-white/10 overflow-x-auto">
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] min-w-[52px] transition-all duration-200 shrink-0 ${
              isActive
                ? 'text-red-500 scale-110'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <link.icon className="h-5 w-5" />
            <span className="font-medium">{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
