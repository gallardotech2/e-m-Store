import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ telefono: '' })
  }

  const supabase = createAdminClient()

  const { data } = await supabase
    .from('profiles')
    .select('telefono, codigo_pais')
    .eq('id', id)
    .eq('activo', true)
    .single()

  return NextResponse.json({
    telefono: data?.telefono ?? '',
    codigo_pais: data?.codigo_pais ?? '+591',
  })
}
