import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateOrigin } from '@/lib/csrf'
import { checkRateLimit } from '@/lib/rate-limit'
import { logAdminAction } from '@/lib/audit'
import { z } from 'zod'

const createLinkSchema = z.object({
  affiliate_id: z.string().uuid('ID de afiliado inválido'),
})

export async function POST(request: NextRequest) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json({ error: 'Origen no válido' }, { status: 403 })
    }

    const { rateLimited, headers } = await checkRateLimit(request, { max: 20 })
    if (rateLimited) {
      return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429, headers })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (user.app_metadata?.rol !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createLinkSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const code = `AF-${parsed.data.affiliate_id.slice(0, 8)}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
    const adminSupabase = createAdminClient()

    const { data, error } = await adminSupabase
      .from('affiliate_links')
      .insert({ afiliado_id: parsed.data.affiliate_id, codigo_unico: code })
      .select('codigo_unico')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')

    await logAdminAction(adminSupabase, {
      accion: 'create',
      tabla: 'affiliate_links',
      registro_id: parsed.data.affiliate_id,
      datos_nuevos: { codigo_unico: code },
      adminId: user.id,
      ip_address: ip ?? undefined,
    })

    return NextResponse.json({ success: true, codigo_unico: data.codigo_unico })
  } catch (e) {
    console.error('Error en POST /api/admin/affiliate-links:', e)
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
