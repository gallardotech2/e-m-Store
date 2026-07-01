import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
export const metadata: Metadata = { robots: { index: false, follow: false } }
import { AffiliateOrdersTable } from './orders-table'

export const dynamic = 'force-dynamic'

export default async function AffiliateOrdersPage() {
  const authSupabase = await createClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  if (!user) return <p>Debes iniciar sesión</p>

  const adminSupabase = createAdminClient()
  const { data: orders } = await adminSupabase
    .from('orders')
    .select('*, products(nombre, precio)')
    .eq('afiliado_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mis Ventas</h1>
      <AffiliateOrdersTable orders={orders ?? []} />
    </div>
  )
}
