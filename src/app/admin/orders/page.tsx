import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } }
import { OrdersTable } from './orders-table'

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, products(nombre, precio), profiles(nombre, email)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>
      <OrdersTable orders={orders ?? []} />
    </div>
  )
}
