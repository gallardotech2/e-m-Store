import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export const registerSchema = z.object({
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().regex(/^\d{7,12}$/, 'Teléfono inválido (solo dígitos, 7-12)'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  codigo: z.string().length(8, 'Código debe tener 8 caracteres'),
})

export const profileUpdateSchema = z.object({
  nombre: z.string().min(2).optional(),
  telefono: z.string().regex(/^\d{7,12}$/).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
