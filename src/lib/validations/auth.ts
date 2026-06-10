import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export const registerSchema = z.object({
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().regex(/^\d{7,12}$/, 'Teléfono inválido (solo dígitos, 7-12)'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[a-z]/, 'Debe tener una minúscula')
    .regex(/[A-Z]/, 'Debe tener una mayúscula')
    .regex(/[0-9]/, 'Debe tener un número')
    .regex(/[^a-zA-Z0-9]/, 'Debe tener un carácter especial'),
  codigo: z.string().length(8, 'Código debe tener 8 caracteres'),
})

export const profileUpdateSchema = z.object({
  nombre: z.string().min(2).optional(),
  telefono: z.string().regex(/^\d{7,12}$/).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
