import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inviteCodeCheckSchema } from '@/lib/validations/api'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const codigo = searchParams.get('codigo')

  if (!codigo) {
    return NextResponse.json({ valid: false }, { status: 400 })
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
}
