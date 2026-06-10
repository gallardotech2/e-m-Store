'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useSearchModal } from '@/hooks/use-search-modal'

export function SearchModal() {
  const { isOpen, closeModal } = useSearchModal()
  const searchParams = useSearchParams()
  const router = useRouter()
  const a = searchParams.get('a')
  const [query, setQuery] = useState('')

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed.length < 2) return
    const params = new URLSearchParams({ buscar: trimmed })
    if (a) params.set('a', a)
    router.push(`/?${params.toString()}`)
    closeModal()
    setQuery('')
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4" onClick={closeModal}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Buscar producto</h2>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe el nombre del producto..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl transition-colors shrink-0"
          >
            <Search className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
