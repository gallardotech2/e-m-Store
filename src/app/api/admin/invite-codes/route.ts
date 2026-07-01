import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateOrigin } from '@/lib/csrf'
import { checkRateLimit } from '@/lib/rate-limit'
import { logAdminAction } from '@/lib/audit'
import { z } from 'zod'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const createCodeSchema = z.object({})

const deleteCodeSchema = z.object({
  codigo: z.string().length(8, 'Código inválido'),
})

function generateCode(): string {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += CHARS[bytes[i] % CHARS.length]
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json({ error: 'Origen no válido' }, { status: 403 })
    }

    const { rateLimited, headers } = await checkRateLimit(request, { max: 10 })
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

    const parsed = createCodeSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const code = generateCode()
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.from('invite_codes').insert({ codigo: code })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')

    await logAdminAction(adminSupabase, {
      accion: 'create',
      tabla: 'invite_codes',
      registro_id: code,
      datos_nuevos: { codigo: code },
      adminId: user.id,
      ip_address: ip ?? undefined,
    })

    return NextResponse.json({ success: true, codigo: code })
  } catch (e) {
    console.error('Error en POST /api/admin/invite-codes:', e)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json({ error: 'Origen no válido' }, { status: 403 })
    }

    const { rateLimited, headers } = await checkRateLimit(request, { max: 10 })
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

    const { searchParams } = new URL(request.url)
    const codigo = searchParams.get('codigo')
    const parsed = deleteCodeSchema.safeParse({ codigo })

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.from('invite_codes').delete().eq('codigo', parsed.data.codigo)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')

    await logAdminAction(adminSupabase, {
      accion: 'delete',
      tabla: 'invite_codes',
      registro_id: parsed.data.codigo,
      datos_previos: { codigo: parsed.data.codigo },
      adminId: user.id,
      ip_address: ip ?? undefined,
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Error en DELETE /api/admin/invite-codes:', e)
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
