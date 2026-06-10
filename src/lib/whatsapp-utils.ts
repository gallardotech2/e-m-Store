import { formatPrice } from '@/lib/utils'

const WHATSAPP_PREFIX = '591'

const DEFAULT_MESSAGE = `¡Hola! 🚀

🔥 *PRODUCTO QUE QUIERO* 🔥
*{producto}*

💰 *Precio final*: *Bs {precio}*

👤 Cliente: {cliente}
💳 Método: {metodoPago}
📋 Orden #{orderId}

¡Listo para pagar ya mismo! ⚡
Gracias por confiar en nosotros 💙`

export function useWhatsApp() {
  function buildWhatsAppUrl(telefono: string, mensaje: string): string {
    const cleanPhone = telefono.replace(/[^0-9]/g, '')
    const fullNumber = `${WHATSAPP_PREFIX}${cleanPhone}`
    return `https://wa.me/${fullNumber}?text=${encodeURIComponent(mensaje)}`
  }

  function buildPurchaseMessage(params: {
    producto: string
    precio: number
    cliente: string
    metodoPago: string
    orderId?: number
    template?: string | null
  }): string {
    const template = params.template || DEFAULT_MESSAGE

    const message = template
      .replace(/\{producto\}/g, params.producto)
      .replace(/\{precio\}/g, formatPrice(params.precio))
      .replace(/\{cliente\}/g, params.cliente)
      .replace(/\{metodoPago\}/g, params.metodoPago)
      .replace(/\{orderId\}/g, params.orderId?.toString() ?? '')

    return message
  }

  return { buildWhatsAppUrl, buildPurchaseMessage }
}
