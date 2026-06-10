import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } }
import { ConfigForm } from './config-form'

export default async function AdminConfigPage() {
  const supabase = await createClient()

  const { data: configs } = await supabase.from('system_config').select('clave, valor')

  const configMap: Record<string, string> = {}
  for (const c of configs ?? []) {
    configMap[c.clave] = c.valor
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>
      <ConfigForm config={configMap} />
    </div>
  )
}
