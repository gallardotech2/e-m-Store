import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth-utils'
export const dynamic = "force-dynamic"
export const metadata: Metadata = { robots: { index: false, follow: false } }
import { FeaturedTable } from './featured-table'
import { FeaturedForm } from './featured-form'

export default async function AdminFeaturedPage() {
  const { user, supabase } = await requireAdmin()
  if (!user || !supabase) return <p className="text-center text-muted-foreground py-8">No autorizado</p>

  const [{ data: featured }, { data: products }] = await Promise.all([
    supabase.from('featured_products').select('*, products(id, nombre, precio)').order('orden'),
    supabase.from('products').select('id, nombre').eq('activo', true).order('nombre'),
  ])

  const usedIds = new Set(featured?.map((f) => f.producto_id) ?? [])
  const availableProducts = (products ?? []).filter((p) => !usedIds.has(p.id))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Productos Destacados</h1>
      <FeaturedForm products={availableProducts} />
      <div className="mt-8">
        <FeaturedTable items={featured ?? []} />
      </div>
    </div>
  )
}
