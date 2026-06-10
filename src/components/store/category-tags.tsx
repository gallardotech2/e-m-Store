'use client'

import { cn } from '@/lib/utils'
import { useCategoryFilter } from '@/hooks/use-category-filter'

interface Category {
  id: number
  nombre: string
  slug: string
}

export function CategoryTags({ categories }: { categories: Category[] }) {
  const { selectedCatId, selectCategory, clearCategory } = useCategoryFilter()

  return (
    <div className="w-full overflow-x-auto scrollbar-none">
      <div className="flex gap-2 px-4 md:px-0 min-w-max pb-2">
        <button
          onClick={clearCategory}
          className={cn(
            'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer',
            !selectedCatId
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          Todas
        </button>
        {categories.map((cat) => {
          const isActive = selectedCatId === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
              className={cn(
                'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer',
                isActive
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {cat.nombre}
            </button>
          )
        })}
      </div>
    </div>
  )
}
