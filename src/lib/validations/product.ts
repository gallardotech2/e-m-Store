import { z } from 'zod'

export const productSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  descripcion: z.string().optional().default(''),
  precio: z.coerce.number().positive('Precio debe ser positivo'),
  precio_original: z.coerce.number().positive().optional().nullable(),
  categoria_id: z.coerce.number().int().optional().nullable(),
  stock: z.coerce.number().int().min(0).default(0),
  precio_envio: z.coerce.number().min(0).default(0),
  envio_gratis: z.boolean().optional(),
  envio_online: z.boolean().optional(),
  envio_recojo: z.boolean().optional(),
})

export const categorySchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
})

export const bannerSchema = z.object({
  titulo: z.string().optional().default(''),
  link: z.string().optional().nullable(),
  producto_id: z.coerce.number().int().optional().nullable(),
  orden: z.coerce.number().int().default(0),
})

export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type BannerInput = z.infer<typeof bannerSchema>
