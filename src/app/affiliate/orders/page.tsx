import { createClient } from '@/lib/supabase/server'
import { AffiliateOrdersTable } from './orders-table'

export default async function AffiliateOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <p>Debes iniciar sesión</p>

  const { data: orders } = await supabase
    .from('orders')
    .select('*, products(nombre, precio)')
    .eq('afiliado_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mis Pedidos</h1>
      <AffiliateOrdersTable orders={orders ?? []} />
    </div>
  )
}
