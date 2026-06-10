'use client'

import { ProductCompactCard } from './product-compact-card'
import { useCategoryFilter } from '@/hooks/use-category-filter'
import type { Product } from '@/types'

export function CompactProductGrid({ products }: { products: Product[] }) {
  const { selectedCatId } = useCategoryFilter()

  const filtered = selectedCatId
    ? products.filter((p) => p.categoria_id === selectedCatId)
    : products

  const display = filtered.slice(0, 8)

  if (display.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-12">
        {selectedCatId
          ? 'No hay productos en esta categoría'
          : 'No hay productos disponibles'}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2 md:grid md:grid-cols-4 md:gap-3">
      {display.map((product, index) => (
        <div key={product.id} className={index >= 3 ? 'hidden md:block' : ''}>
          <ProductCompactCard product={product} />
        </div>
      ))}
    </div>
  )
}
