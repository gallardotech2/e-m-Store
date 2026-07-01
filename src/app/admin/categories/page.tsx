import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth-utils'
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } }
import { CategoriesTable } from './categories-table'
import { CategoryForm } from './category-form'

export default async function AdminCategoriesPage() {
  const { user, supabase } = await requireAdmin()
  if (!user || !supabase) return <p className="text-center text-muted-foreground py-8">No autorizado</p>

  const { data: categories } = await supabase
    .from('categories')
    .select('id, nombre, slug')
    .eq('activo', true)
    .order('nombre')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categorías</h1>
      <CategoryForm />
      <div className="mt-8">
        <CategoriesTable categories={categories ?? []} />
      </div>
    </div>
  )
}
