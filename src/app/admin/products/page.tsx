import { createClient } from '@/lib/supabase/server'
export const dynamic = "force-dynamic";
import { ProductsTable } from './products-table'
import { ProductForm } from './product-form'

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, categories(nombre)').eq('activo', true).order('created_at', { ascending: false }),
    supabase.from('categories').select('*').eq('activo', true).order('nombre'),
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
