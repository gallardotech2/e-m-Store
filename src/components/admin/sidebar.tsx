'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Tags, Image, Users,
  ShoppingCart, Settings, LogOut, Store, Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const links = [
  { href: '/admin', icon: LayoutDashboard, label: 'Panel' },
  { href: '/admin/products', icon: Package, label: 'Productos' },
  { href: '/admin/categories', icon: Tags, label: 'Categorías' },
  { href: '/admin/featured', icon: Star, label: 'Destacados' },
  { href: '/admin/banners', icon: Image, label: 'Banners' },
  { href: '/admin/affiliates', icon: Users, label: 'Afiliados' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Pedidos' },
  { href: '/admin/config', icon: Settings, label: 'Configuración' },
]

export function AdminSidebar() {
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
      <div className="p-5 text-center border-b border-white/10">
        <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-indigo-600 flex items-center justify-center text-lg font-bold">
          e
        </div>
        <h2 className="text-base font-bold">e-m Store</h2>
        <p className="text-[11px] text-white/50">Panel Administrativo</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <link.icon className="h-5 w-5 shrink-0" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <Store className="h-5 w-5 shrink-0" />
          Ver Tienda
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-white/60 hover:text-white hover:bg-white/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 shrink-0 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  )
}
