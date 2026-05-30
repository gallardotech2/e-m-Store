import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link2, ShoppingCart, DollarSign } from 'lucide-react'

export default async function AffiliateDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <p>Debes iniciar sesión</p>

  const [{ count: linksCount }, { data: orders }] = await Promise.all([
    supabase.from('affiliate_links').select('*', { count: 'exact', head: true }).eq('afiliado_id', user.id),
    supabase.from('orders').select('total').eq('afiliado_id', user.id),
  ])

  const totalVentas = orders?.reduce((sum, o) => sum + Number(o.total ?? 0), 0) ?? 0
  const totalPedidos = orders?.length ?? 0

  const stats = [
    { icon: Link2, label: 'Mis Links', value: linksCount ?? 0, color: 'bg-blue-600' },
    { icon: ShoppingCart, label: 'Pedidos', value: totalPedidos, color: 'bg-green-600' },
    { icon: DollarSign, label: 'Ventas (Bs)', value: totalVentas.toLocaleString(), color: 'bg-yellow-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-6">Bienvenido, {user.user_metadata?.nombre ?? user.email}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <a href="/affiliate/links" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            + Nuevo Link
          </a>
          <a href="/affiliate/orders" className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900 transition-colors">
            Mis Pedidos
          </a>
          <a href="/" target="_blank" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
            Ver Tienda
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
