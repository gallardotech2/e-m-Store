import { createClient } from '@/lib/supabase/server'
import { AffiliateLinksClient } from './client'

export default async function AffiliateLinksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <p>Debes iniciar sesión</p>

  const { data: links } = await supabase
    .from('affiliate_links')
    .select('*, products(nombre, precio, imagen_url)')
    .eq('afiliado_id', user.id)
    .order('created_at', { ascending: false })

  const { data: products } = await supabase
    .from('products')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')

  return <AffiliateLinksClient links={links ?? []} products={products ?? []} afiliadoId={user.id} />
}
