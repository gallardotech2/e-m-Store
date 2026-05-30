import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Tags, ShoppingCart, Users } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: prodCount },
    { count: catCount },
    { count: orderCount },
    { count: affCount },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('categories').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('rol', 'afiliado'),
  ])

  const stats = [
    { icon: Tags, label: 'Categorías', value: catCount ?? 0, color: 'bg-red-600' },
    { icon: Package, label: 'Productos', value: prodCount ?? 0, color: 'bg-green-600' },
    { icon: ShoppingCart, label: 'Pedidos', value: orderCount ?? 0, color: 'bg-blue-600' },
    { icon: Users, label: 'Afiliados', value: affCount ?? 0, color: 'bg-yellow-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <a href="/admin/products" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors">
            + Nuevo Producto
          </a>
          <a href="/admin/categories" className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900 transition-colors">
            + Nueva Categoría
          </a>
          <a href="/admin/affiliates" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            + Código Afiliado
          </a>
          <a href="/" target="_blank" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
            Ver Tienda
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
