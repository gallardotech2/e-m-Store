import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

    const adminSupabase = createAdminClient()
    const { data: newOrder, error: insertError } = await adminSupabase
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

    if (insertError || !newOrder) {
      console.error('Error creando orden:', JSON.stringify(insertError, null, 2))
      return NextResponse.json({ error: `Error al crear la orden: ${insertError?.message ?? 'Error desconocido'}` }, { status: 500 })
    }

    let telefono_afiliado = ''
    let codigo_pais_afiliado = '+591'
    if (resolvedAfiliadoId) {
      const { data: affProfile } = await adminSupabase
        .from('profiles')
        .select('telefono, codigo_pais')
        .eq('id', resolvedAfiliadoId)
        .maybeSingle()
      telefono_afiliado = affProfile?.telefono ?? ''
      codigo_pais_afiliado = affProfile?.codigo_pais ?? '+591'
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      telefono_afiliado,
      codigo_pais_afiliado,
    })
  } catch (e) {
    console.error('Error en POST /api/orders:', e)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
