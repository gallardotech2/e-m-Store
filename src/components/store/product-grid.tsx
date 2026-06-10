import { ProductCard } from './product-card'
import Link from 'next/link'
import { Product } from '@/types'

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
  products,
}: {
  categories: Category[]
  buscar: string
  catId: number | null
  mostrarTodo: boolean
  products: Product[]
}) {
  if (buscar) return null

  const catsToRender = catId
    ? categories.filter((c) => c.id === catId)
    : categories

  const catIds = catsToRender.map((c) => c.id)

  if (catIds.length === 0) return null

  const productsByCategory = new Map<number, Product[]>()
  for (const p of products) {
    const catId = p.categoria_id
    if (catId !== null && catIds.includes(catId)) {
      const list = productsByCategory.get(catId) ?? []
      list.push(p)
      productsByCategory.set(catId, list)
    }
  }

  const sections = catsToRender
    .map((cat) => {
      const products = (productsByCategory.get(cat.id) ?? []).slice(0, mostrarTodo ? undefined : 10)
      if (!products.length) return null

      return (
        <div key={cat.id} id={`cat-${cat.id}`}>
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
                : 'flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory'
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
    })
    .filter(Boolean)

  return (
    <section className="py-8" id="productos-categoria">
      <div className="container mx-auto px-4 space-y-10">
        {sections}
      </div>
    </section>
  )
}
