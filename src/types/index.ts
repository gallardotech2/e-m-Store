export type Rol = 'admin' | 'afiliado'

export interface Profile {
  id: string
  nombre: string
  email: string
  telefono: string | null
  codigo_pais: string
  rol: Rol
  activo: boolean
  fecha_registro: string
  ultimo_acceso: string | null
}

export interface Category {
  id: number
  nombre: string
  slug: string
  activo: boolean
  created_at: string
}

export interface Product {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  precio_original: number | null
  categoria_id: number | null
  imagen_url: string | null
  activo: boolean
  created_at: string
  categories?: Category
}

export interface Banner {
  id: number
  titulo: string | null
  imagen_url: string
  link: string | null
  orden: number
  activo: boolean
}

export interface AffiliateLink {
  id: number
  afiliado_id: string
  producto_id: number | null
  codigo_unico: string
  clicks: number
  created_at: string
}

export interface AffiliateCookie {
  id: number
  afiliado_id: string
  token: string
  expira: string
  created_at: string
}

export type OrderEstado = 'pendiente' | 'enviado' | 'completado' | 'cancelado'

export interface Order {
  id: number
  afiliado_id: string | null
  producto_id: number | null
  cantidad: number
  total: number | null
  telefono_cliente: string | null
  estado: OrderEstado
  whatsapp_message_enviado: boolean
  created_at: string
  products?: Product
  profiles?: Profile
}

export interface SystemConfig {
  clave: string
  valor: string
}
