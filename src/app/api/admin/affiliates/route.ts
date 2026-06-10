import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { affiliateActionSchema } from '@/lib/validations/api'
import { validateOrigin } from '@/lib/csrf'
import { checkRateLimit } from '@/lib/rate-limit'
import { logAdminAction } from '@/lib/audit'

export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: 'Solo administradores pueden modificar afiliados' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = affiliateActionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { action, affiliate_id } = parsed.data

  const { data: oldProfile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', affiliate_id)
    .single()

  const { error } = await supabase
    .from('profiles')
    .update({ status: action })
    .eq('id', affiliate_id)

  if (error) {
    console.error('Error actualizando afiliado:', error)
    return NextResponse.json({ error: 'Error al actualizar afiliado' }, { status: 500 })
  }

  await logAdminAction(supabase, {
    accion: 'update',
    tabla: 'profiles',
    registro_id: affiliate_id,
    datos_previos: oldProfile ? { status: oldProfile.status } : null,
    datos_nuevos: { status: action },
    adminId: user.id,
  })

  return NextResponse.json({ success: true })
}
