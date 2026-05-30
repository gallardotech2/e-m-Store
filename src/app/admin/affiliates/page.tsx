import { createClient } from '@/lib/supabase/server'
import { AffiliatesTable } from './affiliates-table'

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
      affiliate_links(count)
    `)
    .eq('rol', 'afiliado')
    .eq('activo', true)
    .order('fecha_registro', { ascending: false })

  const { data: orders } = await supabase
    .from('orders')
    .select('afiliado_id, total')
    .not('afiliado_id', 'is', null)

  const commissionsMap = new Map<string, number>()
  for (const o of orders ?? []) {
    const current = commissionsMap.get(o.afiliado_id) ?? 0
    commissionsMap.set(o.afiliado_id, current + Number(o.total ?? 0))
  }

  const affiliatesWithStats = (affiliates ?? []).map((aff) => ({
    ...aff,
    total_comisiones: commissionsMap.get(aff.id) ?? 0,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Afiliados</h1>
      <AffiliatesTable affiliates={affiliatesWithStats} />
    </div>
  )
}
