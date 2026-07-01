import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
export const metadata: Metadata = { robots: { index: false, follow: false } }
import { Card, CardContent } from '@/components/ui/card'
import { Link2, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { headers } from 'next/headers'
import { DashboardCopyLink } from './dashboard-copy-link'
import { AffiliateOrdersTable } from './orders/orders-table'

export const dynamic = 'force-dynamic'

export default async function AffiliateDashboard() {
  const authSupabase = await createClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  if (!user) return <p>Debes iniciar sesión</p>

  const adminSupabase = createAdminClient()
  const [{ count: linksCount }, { data: profile }, { data: orders }] = await Promise.all([
    adminSupabase.from('affiliate_links').select('*', { count: 'exact', head: true }).eq('afiliado_id', user.id),
    authSupabase.from('profiles').select('codigo_corto, nombre').eq('id', user.id).maybeSingle(),
    adminSupabase.from('orders').select('*, products(nombre, precio)').eq('afiliado_id', user.id).order('created_at', { ascending: false }),
  ])

  const host = (await headers()).get('host') ?? 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const origin = `${protocol}://${host}`
  const linkUrl = `${origin}/?a=${profile?.codigo_corto ?? ''}`

  const totalVentas = orders?.reduce((sum, o) => sum + Number(o.total ?? 0), 0) ?? 0
  const totalPedidos = orders?.length ?? 0
  const recentOrders = orders?.slice(0, 5) ?? []

  const stats = [
    { icon: Link2, label: 'Links', value: linksCount ?? 0, gradient: 'from-blue-500 to-blue-600', href: '/affiliate/links' },
    { icon: ShoppingCart, label: 'Pedidos', value: totalPedidos, gradient: 'from-emerald-500 to-emerald-600', href: '/affiliate/orders' },
    { icon: DollarSign, label: 'Ventas', value: `Bs ${formatPrice(totalVentas)}`, gradient: 'from-amber-500 to-orange-500', href: '/affiliate/orders' },
    { icon: TrendingUp, label: 'Promedio', value: totalPedidos > 0 ? `Bs ${formatPrice(Math.round(totalVentas / totalPedidos))}` : 'Bs 0', gradient: 'from-purple-500 to-pink-500', href: '/affiliate/orders' },
  ]

  const quickActions = [
    { label: '+ Nuevo Link', href: '/affiliate/links', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Mis Ventas', href: '/affiliate/orders', color: 'bg-gray-800 hover:bg-gray-900' },
    { label: 'Ver Tienda', href: '/', color: 'bg-emerald-600 hover:bg-emerald-700', external: true },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel</h1>
        <p className="text-muted-foreground text-sm">Bienvenido, {profile?.nombre ?? user.user_metadata?.nombre ?? user.email}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className={`p-4 md:p-5 bg-gradient-to-br ${stat.gradient} text-white rounded-lg`}>
                <stat.icon className="h-7 w-7 md:h-8 md:w-8 mb-3 opacity-90" />
                <p className="text-xl md:text-2xl font-bold leading-tight">{stat.value}</p>
                <p className="text-xs md:text-sm opacity-80 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {profile?.codigo_corto && <DashboardCopyLink linkUrl={linkUrl} />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            target={action.external ? '_blank' : undefined}
            className={`${action.color} text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors text-center`}
          >
            {action.label}
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Últimas Ventas</h2>
        <AffiliateOrdersTable orders={recentOrders} />
      </div>
    </div>
  )
}
