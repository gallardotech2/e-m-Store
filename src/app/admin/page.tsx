import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Package, Tags, ShoppingCart, Users, TrendingUp, DollarSign } from 'lucide-react'
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
  const authSupabase = await createClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  if (!user) return <p>Debes iniciar sesión</p>

  const supabase = authSupabase

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
    { icon: Package, label: 'Productos', value: prodCount ?? 0, gradient: 'from-emerald-500 to-emerald-600', href: '/admin/products' },
    { icon: Tags, label: 'Categorías', value: catCount ?? 0, gradient: 'from-red-500 to-red-600', href: '/admin/categories' },
    { icon: ShoppingCart, label: 'Pedidos', value: orderCount ?? 0, gradient: 'from-blue-500 to-blue-600', href: '/admin/orders' },
    { icon: Users, label: 'Afiliados', value: affCount ?? 0, gradient: 'from-amber-500 to-orange-500', href: '/admin/affiliates' },
    { icon: DollarSign, label: 'Ventas (Bs)', value: formatPrice(totalVentas), gradient: 'from-purple-500 to-pink-500', href: '/admin/orders' },
    { icon: TrendingUp, label: 'Promedio', value: `Bs ${formatPrice(promedioPedido)}`, gradient: 'from-cyan-500 to-blue-500', href: '/admin/orders' },
  ]

  const quickActions = [
    { label: '+ Producto', href: '/admin/products', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: '+ Categoría', href: '/admin/categories', color: 'bg-red-600 hover:bg-red-700' },
    { label: '+ Banners', href: '/admin/banners', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Ver Tienda', href: '/', color: 'bg-gray-800 hover:bg-gray-900', external: true },
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
      <div>
        <h1 className="text-2xl font-bold">Panel Admin</h1>
        <p className="text-muted-foreground text-sm">Bienvenido, {user.user_metadata?.nombre ?? user.email}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Últimos Pedidos</h2>
          <Link href="/admin/orders" className="text-sm text-red-600 hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="border rounded-lg overflow-hidden">
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
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Sin pedidos aún
                  </TableCell>
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
                    <TableCell className="text-sm text-muted-foreground">
                      {timeAgo(order.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
