import { createClient } from '@/lib/supabase/server'
export const dynamic = "force-dynamic";
import { AffiliatesTable } from './affiliates-table'
import { InviteCodesTable } from './invite-codes'

export default async function AdminAffiliatesPage() {
  const supabase = await createClient()

  const { data: affiliates } = await supabase
    .from('profiles')
    .select(`
      id,
      nombre,
      email,
      telefono,
      fecha_registro,
      status,
      codigo_corto,
      affiliate_links(count)
    `)
    .eq('rol', 'afiliado')
    .order('fecha_registro', { ascending: false })

  const { data: commissionsData } = await supabase
    .from('orders')
    .select('afiliado_id, total.sum()')
    .not('afiliado_id', 'is', null)

  const commissionsMap = new Map<string, number>()
  for (const c of commissionsData ?? []) {
    commissionsMap.set(c.afiliado_id, Number(c.sum ?? 0))
  }

  const affiliatesWithStats = (affiliates ?? []).map((aff) => ({
    ...aff,
    total_comisiones: commissionsMap.get(aff.id) ?? 0,
  }))

  const { data: inviteCodes } = await supabase
    .from('invite_codes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Afiliados</h1>
      <InviteCodesTable codes={inviteCodes ?? []} />
      <AffiliatesTable affiliates={affiliatesWithStats} />
    </div>
  )
}
