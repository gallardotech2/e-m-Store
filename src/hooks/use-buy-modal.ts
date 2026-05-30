'use client'

import { create } from 'zustand'

interface Product {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  precio_original: number | null
  imagen_url: string | null
  stock: number
}

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
