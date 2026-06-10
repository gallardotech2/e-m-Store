import { create } from 'zustand'

interface SystemConfigState {
  mensajeConfirmacion: string | null
  setMensajeConfirmacion: (val: string) => void
}

export const useSystemConfigStore = create<SystemConfigState>((set) => ({
  mensajeConfirmacion: null,
  setMensajeConfirmacion: (val) => set({ mensajeConfirmacion: val }),
}))
