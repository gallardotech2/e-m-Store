import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth-utils'
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } }
import { ProductsTable } from './products-table'
import { ProductForm } from './product-form'

export default async function AdminProductsPage() {
  const { user, supabase } = await requireAdmin()
  if (!user || !supabase) return <p className="text-center text-muted-foreground py-8">No autorizado</p>

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, categories(nombre)').eq('activo', true).order('created_at', { ascending: false }),
    supabase.from('categories').select('id, nombre').eq('activo', true).order('nombre'),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Productos</h1>
      <ProductForm categories={categories ?? []} />
      <div className="mt-8">
        <ProductsTable products={products ?? []} />
      </div>
    </div>
  )
}
