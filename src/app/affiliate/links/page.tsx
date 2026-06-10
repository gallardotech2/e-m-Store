import { createClient } from '@/lib/supabase/server'
import { AffiliateLinksClient } from './client'

export default async function AffiliateLinksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <p>Debes iniciar sesión</p>

  const { data: profile } = await supabase
    .from('profiles')
    .select('codigo_corto, telefono, codigo_pais')
    .eq('id', user.id)
    .single()

  return (
    <AffiliateLinksClient
      afiliadoId={user.id}
      codigoCorto={profile?.codigo_corto ?? ''}
      telefono={profile?.telefono ?? ''}
      codigoPais={profile?.codigo_pais ?? '+591'}
    />
  )
}
