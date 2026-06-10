import type { SupabaseClient } from '@supabase/supabase-js'

export async function resolveAffiliateId(
  supabase: SupabaseClient,
  id: string | null | undefined
): Promise<string | null> {
  if (!id) return null
  if (id.includes('-')) return id

  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('codigo_corto', id)
    .maybeSingle()

  return data?.id ?? null
}
