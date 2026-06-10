import { createClient } from '@/lib/supabase/server'
export const dynamic = "force-dynamic";
import { CategoriesTable } from './categories-table'
import { CategoryForm } from './category-form'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()

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
