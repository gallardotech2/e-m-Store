import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveAffiliateId } from '@/lib/affiliate-utils'
import { orderSchema } from '@/lib/validations/api'
import { validateOrigin } from '@/lib/csrf'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Origen no válido' }, { status: 403 })
  }

  const { rateLimited, headers } = await checkRateLimit(request, { max: 10 })
  if (rateLimited) {
    return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429, headers })
  }

  try {
    const body = await request.json()
    const parsed = orderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { producto_id, cantidad, cliente_nombre, telefono_cliente, metodo_pago, afiliado_id } = parsed.data

    const supabase = await createClient()

    const { data: product } = await supabase
      .from('products')
      .select('precio, activo')
      .eq('id', producto_id)
      .single()

    if (!product || !product.activo) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const resolvedAfiliadoId = await resolveAffiliateId(supabase, afiliado_id ?? null)

    const total = product.precio * cantidad

    const { data, error } = await supabase
      .from('orders')
      .insert({
        producto_id,
        cantidad,
        total,
        cliente_nombre,
        telefono_cliente: telefono_cliente ?? null,
        metodo_pago,
        afiliado_id: resolvedAfiliadoId,
        estado: 'pendiente',
        whatsapp_message_enviado: false,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creando orden:', error)
      return NextResponse.json({ error: 'Error al crear la orden' }, { status: 500 })
    }

    return NextResponse.json({ success: true, orderId: data.id })
  } catch (e) {
    console.error('Error en POST /api/orders:', e)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
