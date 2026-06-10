'use client'

import { create } from 'zustand'

interface CategoriesModalState {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const useCategoriesModal = create<CategoriesModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}))
