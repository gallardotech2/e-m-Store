import { createClient } from '@/lib/supabase/server'
import { ProductCard } from './product-card'
import Link from 'next/link'

interface Category {
  id: number
  nombre: string
  slug: string
}

export async function ProductGrid({
  categories,
  buscar,
  catId,
  mostrarTodo,
}: {
  categories: Category[]
  buscar: string
  catId: number | null
  mostrarTodo: boolean
}) {
  const supabase = await createClient()

  if (buscar) return null

  const catsToRender = catId
    ? categories.filter((c) => c.id === catId)
    : categories

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 space-y-10">
        {catsToRender.map(async (cat) => {
          const query = supabase
            .from('products')
            .select('*')
            .eq('activo', true)
            .eq('categoria_id', cat.id)
            .order('created_at', { ascending: false })

          if (!mostrarTodo) query.limit(10)

          const { data: products } = await query

          if (!products?.length) return null

          return (
            <div key={cat.id}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{cat.nombre}</h2>
                {!mostrarTodo && products.length >= 10 && (
                  <Link
                    href={`/?cat=${cat.id}&todo=1`}
                    className="text-sm text-red-600 hover:underline font-medium"
                  >
                    Ver todo →
                  </Link>
                )}
              </div>
              <div
                className={`${
                  mostrarTodo
                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                    : 'flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory'
                }`}
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={mostrarTodo ? '' : 'snap-start shrink-0 w-64'}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
