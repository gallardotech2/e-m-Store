import type { SupabaseClient } from '@supabase/supabase-js'

interface LogParams {
  accion: 'create' | 'update' | 'delete'
  tabla: string
  registro_id?: string | number
  datos_previos?: Record<string, unknown> | null
  datos_nuevos?: Record<string, unknown> | null
  adminId?: string
}

export async function logAdminAction(
  supabase: SupabaseClient,
  { adminId, accion, tabla, registro_id, datos_previos, datos_nuevos }: LogParams
) {
  if (!adminId) {
    const { data: { user } } = await supabase.auth.getUser()
    adminId = user?.id
  }
  if (!adminId) return

  await supabase.from('admin_audit_log').insert({
    admin_id: adminId,
    accion,
    tabla,
    registro_id: String(registro_id ?? ''),
    datos_previos: datos_previos ?? null,
    datos_nuevos: datos_nuevos ?? null,
  })
}
