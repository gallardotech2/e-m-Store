import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { producto_id, cantidad, total, cliente_nombre, metodo_pago, afiliado_id } = body

    if (!producto_id || !cliente_nombre || !metodo_pago) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('orders')
      .insert({
        producto_id,
        cantidad: cantidad ?? 1,
        total: total ?? 0,
        cliente_nombre,
        metodo_pago,
        afiliado_id: afiliado_id || null,
        estado: 'pendiente',
        whatsapp_message_enviado: false,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, orderId: data.id })
  } catch (err) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
