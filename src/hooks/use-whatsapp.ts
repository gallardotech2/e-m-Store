const WHATSAPP_PREFIX = '591'

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
  }): string {
    const lines = [
      '¡Hola E-MStore! 🚀',
      '',
      `🔥 *PRODUCTO QUE QUIERO* 🔥`,
      `*${params.producto}*`,
      '',
      `💰 *Precio final*: *Bs ${params.precio.toLocaleString()}*`,
      '',
      `👤 Cliente: ${params.cliente}`,
      `💳 Método: ${params.metodoPago}`,
      ...(params.orderId ? [`📋 Orden #${params.orderId}`] : []),
      '',
      '¡Listo para pagar ya mismo! ⚡',
      'Gracias por confiar en nosotros 💙',
    ]
    return lines.join('\n')
  }

  return { buildWhatsAppUrl, buildPurchaseMessage }
}
