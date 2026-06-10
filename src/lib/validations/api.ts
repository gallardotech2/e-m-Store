import { z } from 'zod'

export const orderSchema = z.object({
  producto_id: z.number({ message: 'Producto requerido' }),
  cantidad: z.number().int().positive().optional().default(1),
  cliente_nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  telefono_cliente: z.string().optional(),
  metodo_pago: z.string().min(1, 'Método de pago requerido'),
  afiliado_id: z.string().nullable().optional(),
})

export const uploadSchema = z.object({
  bucket: z.enum(['products', 'banners']),
})

export const affiliateActionSchema = z.object({
  action: z.enum(['aprobado', 'rechazado', 'pendiente']),
  affiliate_id: z.string().uuid('ID de afiliado inválido'),
})

export const inviteCodeCheckSchema = z.object({
  codigo: z.string().length(8, 'Código debe tener 8 caracteres'),
})

export const inviteCodeConsumeSchema = z.object({
  codigo: z.string().length(8, 'Código debe tener 8 caracteres'),
  userId: z.string().uuid('ID de usuario inválido'),
})
