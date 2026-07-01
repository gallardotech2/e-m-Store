import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inviteCodeCheckSchema } from '@/lib/validations/api'
import { validateOrigin } from '@/lib/csrf'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(request: Request) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json({ valid: false, message: 'Origen no válido' }, { status: 403 })
    }

    const { rateLimited, headers } = await checkRateLimit(request, { max: 10 })
    if (rateLimited) {
      return NextResponse.json({ valid: false, message: 'Demasiadas solicitudes' }, { status: 429, headers })
    }

    const { searchParams } = new URL(request.url)
    const codigo = searchParams.get('codigo')

    if (!codigo) {
      return NextResponse.json({ valid: false, message: 'Código requerido' }, { status: 400 })
    }

    const parsed = inviteCodeCheckSchema.safeParse({ codigo })
    if (!parsed.success) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const supabase = await createClient()

    const { data } = await supabase
      .from('invite_codes')
      .select('codigo')
      .eq('codigo', codigo)
      .eq('usado', false)
      .maybeSingle()

    return NextResponse.json({ valid: !!data })
  } catch (e) {
    console.error('Error en GET /api/invite-codes:', e)
    return NextResponse.json({ valid: false, message: 'Error interno' }, { status: 500 })
  }
}

export async function POST() {
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
