'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Link2,
  ShoppingCart,
  User,
  LogOut,
  Store,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/affiliate', icon: LayoutDashboard, label: 'Panel' },
  { href: '/affiliate/links', icon: Link2, label: 'Mis Links' },
  { href: '/affiliate/orders', icon: ShoppingCart, label: 'Mis Ventas' },
  { href: '/affiliate/profile', icon: User, label: 'Mi Perfil' },
]

export function AffiliateSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-[#1a1a2e] text-white min-h-screen flex flex-col">
      <div className="p-4 text-center border-b border-white/10">
        <h2 className="text-xl font-black">e-m Store</h2>
        <p className="text-xs text-white/60">Panel Afiliado</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-red-600 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Store className="h-5 w-5" />
          Ver Tienda
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  )
}
