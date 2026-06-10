'use client'

import dynamic from 'next/dynamic'

const BuyModal = dynamic(() => import('./buy-modal').then(m => ({ default: m.BuyModal })), { ssr: false })
const SearchModal = dynamic(() => import('./search-modal').then(m => ({ default: m.SearchModal })), { ssr: false })
const CategoriesModal = dynamic(() => import('./categories-modal').then(m => ({ default: m.CategoriesModal })), { ssr: false })

interface Category {
  id: number
  nombre: string
  slug: string
}

export function ModalWrapper({ categories }: { categories: Category[] }) {
  return (
    <>
      <BuyModal />
      <SearchModal />
      <CategoriesModal categories={categories} />
    </>
  )
}
