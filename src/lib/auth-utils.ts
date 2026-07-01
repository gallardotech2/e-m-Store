import { createClient } from '@/lib/supabase/server'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.rol !== 'admin') {
    return { user: null, supabase: null }
  }

  return { user, supabase }
}
