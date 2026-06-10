import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveAffiliateId } from '@/lib/affiliate-utils'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const { rateLimited, headers } = await checkRateLimit(request, { max: 30 })
  if (rateLimited) {
    return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429, headers })
  }
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ telefono: '' })
  }

  const supabase = await createClient()

  const resolvedId = await resolveAffiliateId(supabase, id)
  if (!resolvedId) {
    return NextResponse.json({ telefono: '' })
  }

  const { data } = await supabase
    .from('profiles')
    .select('telefono, codigo_pais')
    .eq('id', resolvedId)
    .eq('activo', true)
    .eq('rol', 'afiliado')
    .single()

  return NextResponse.json({
    telefono: data?.telefono ?? '',
    codigo_pais: data?.codigo_pais ?? '+591',
  })
}
