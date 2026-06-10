'use client'

import { create } from 'zustand'

interface CategoryFilterState {
  selectedCatId: number | null
  selectCategory: (id: number) => void
  clearCategory: () => void
}

export const useCategoryFilter = create<CategoryFilterState>((set) => ({
  selectedCatId: null,
  selectCategory: (id) => set({ selectedCatId: id }),
  clearCategory: () => set({ selectedCatId: null }),
}))
