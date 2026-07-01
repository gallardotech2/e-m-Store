import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth-utils'
export const metadata: Metadata = { robots: { index: false, follow: false } }
import { Card, CardContent } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Package, Tags, ShoppingCart, Users, TrendingUp, DollarSign, ArrowUpRight, Store, Image } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function timeAgo(date: string | null | undefined) {
  if (!date) return '—'
  const time = new Date(date).getTime()
  if (isNaN(time)) return '—'
  const diff = Date.now() - time
  if (diff < 0) return '—'
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `hace ${days}d`
}

export default async function AdminDashboard() {
  const { user, supabase } = await requireAdmin()
  if (!user || !supabase) return <p className="text-center text-muted-foreground py-8">No autorizado</p>

  const [
    { count: prodCount },
    { count: catCount },
    { count: orderCount },
    { count: affCount },
    { data: orderAmounts },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('categories').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('rol', 'afiliado'),
    supabase.from('orders').select('total'),
    supabase.from('orders').select('*, products(nombre)').order('created_at', { ascending: false }).limit(5),
  ])

  const totalVentas = orderAmounts?.reduce((sum, o) => sum + Number(o.total ?? 0), 0) ?? 0
  const promedioPedido = orderCount && orderCount > 0 ? Math.round(totalVentas / orderCount) : 0

  const stats = [
    { icon: Package, label: 'Productos', value: prodCount ?? 0, color: 'text-emerald-600 bg-emerald-100', href: '/admin/products' },
    { icon: Tags, label: 'Categorías', value: catCount ?? 0, color: 'text-blue-600 bg-blue-100', href: '/admin/categories' },
    { icon: ShoppingCart, label: 'Pedidos', value: orderCount ?? 0, color: 'text-indigo-600 bg-indigo-100', href: '/admin/orders' },
    { icon: Users, label: 'Afiliados', value: affCount ?? 0, color: 'text-amber-600 bg-amber-100', href: '/admin/affiliates' },
    { icon: DollarSign, label: 'Ventas (Bs)', value: formatPrice(totalVentas), color: 'text-purple-600 bg-purple-100', href: '/admin/orders' },
    { icon: TrendingUp, label: 'Promedio x Pedido', value: `Bs ${formatPrice(promedioPedido)}`, color: 'text-cyan-600 bg-cyan-100', href: '/admin/orders' },
  ]

  const quickActions = [
    { label: 'Nuevo Producto', href: '/admin/products', icon: Package },
    { label: 'Nueva Categoría', href: '/admin/categories', icon: Tags },
    { label: 'Nuevo Banner', href: '/admin/banners', icon: Image },
    { label: 'Ver Tienda', href: '/', icon: Store, external: true },
  ]

  interface RecentOrder {
    id: number
    cliente_nombre: string | null
    total: number
    estado: string
    created_at: string
    products: { nombre: string } | null
  }

  const statusBadge: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    enviado: 'bg-blue-100 text-blue-800',
    completado: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">

      <Card className="border-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-bold">
              Bienvenido, {user.user_metadata?.nombre ?? user.email?.split('@')[0] ?? 'Admin'}
            </h1>
            <p className="text-indigo-200 text-sm">
              Gestioná tu tienda desde este panel
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg text-sm font-medium transition-colors"
            >
              <Store className="h-4 w-4" />
              Ir a la Tienda
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="hidden sm:block text-6xl opacity-20 select-none">
            <ShoppingCart className="h-24 w-24" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 md:p-5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            target={action.external ? '_blank' : undefined}
            className="flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:text-gray-900 px-4 py-3 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Link>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold">Últimos Pedidos</h2>
            <Link href="/admin/orders" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Ver todos &rarr;
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!recentOrders || recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Sin pedidos aún</TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order: RecentOrder) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.cliente_nombre ?? '—'}</TableCell>
                    <TableCell>{order.products?.nombre ?? '—'}</TableCell>
                    <TableCell className="font-bold">Bs {formatPrice(Number(order.total))}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge[order.estado] ?? 'bg-gray-100 text-gray-800'}`}>
                        {order.estado}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{timeAgo(order.created_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
