'use client'

import { X, Tags } from 'lucide-react'
import { useCategoriesModal } from '@/hooks/use-categories-modal'

interface Category {
  id: number
  nombre: string
  slug: string
}

export function CategoriesModal({ categories }: { categories: Category[] }) {
  const { isOpen, closeModal } = useCategoriesModal()

  if (!isOpen) return null

  function handleSelect(catId: number) {
    closeModal()
    setTimeout(() => {
      document.getElementById(`cat-${catId}`)?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4" onClick={closeModal}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tags className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-bold text-gray-900">Categorías</h2>
          </div>
          <button onClick={closeModal} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay categorías disponibles</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className="bg-gray-50 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-300 rounded-xl px-4 py-4 text-left transition-all font-medium text-gray-800"
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
