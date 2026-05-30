import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './profile-form'

export default async function AffiliateProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <p>Debes iniciar sesión</p>

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return <ProfileForm profile={profile} />
}
