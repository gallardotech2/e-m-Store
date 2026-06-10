import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
export const metadata: Metadata = { robots: { index: false, follow: false } }
import { headers } from 'next/headers'
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

  const host = (await headers()).get('host') ?? 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const origin = `${protocol}://${host}`

  return (
    <AffiliateLinksClient
      afiliadoId={user.id}
      codigoCorto={profile?.codigo_corto ?? ''}
      telefono={profile?.telefono ?? ''}
      codigoPais={profile?.codigo_pais ?? '+591'}
      origin={origin}
    />
  )
}
