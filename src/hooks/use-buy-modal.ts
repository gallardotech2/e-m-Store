'use client'

import { create } from 'zustand'
import type { Product } from '@/types'

interface BuyModalState {
  isOpen: boolean
  product: Product | null
  openModal: (product: Product) => void
  closeModal: () => void
}

export const useBuyModal = create<BuyModalState>((set) => ({
  isOpen: false,
  product: null,
  openModal: (product) => set({ isOpen: true, product }),
  closeModal: () => set({ isOpen: false, product: null }),
}))
