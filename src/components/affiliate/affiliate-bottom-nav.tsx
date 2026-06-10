'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Link2, ShoppingCart, User } from 'lucide-react'

const links = [
  { href: '/affiliate', icon: LayoutDashboard, label: 'Panel' },
  { href: '/affiliate/links', icon: Link2, label: 'Links' },
  { href: '/affiliate/orders', icon: ShoppingCart, label: 'Pedidos' },
  { href: '/affiliate/profile', icon: User, label: 'Perfil' },
]

export function AffiliateBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-[#1a1a2e] text-white flex justify-around items-center h-14 border-t border-white/10">
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-all duration-200 ${
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
