'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const fields = [
  { key: 'sitio_nombre', label: 'Nombre de la Tienda', placeholder: 'E-M Store' },
  { key: 'admin_whatsapp_fallback', label: 'WhatsApp Admin', placeholder: '591XXXXXXXXX' },
  { key: 'moneda_simbolo', label: 'Símbolo Monetario', placeholder: 'Bs' },
  { key: 'afiliado_cookie_dias', label: 'Días Cookie Afiliado', placeholder: '90' },
]

export function ConfigForm({ config }: { config: Record<string, string> }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

    const updates = fields.map((f) => ({
      clave: f.key,
      valor: (form.get(f.key) as string) || '',
    }))

    for (const u of updates) {
      const { error } = await supabase
        .from('system_config')
        .upsert({ clave: u.clave, valor: u.valor }, { onConflict: 'clave' })

      if (error) {
        toast.error(`Error en ${u.clave}: ${error.message}`)
        setLoading(false)
        return
      }
    }

    toast.success('Configuración guardada')
    router.refresh()
    setLoading(false)
  }

  return (
    <Card className="border-0 shadow-md max-w-xl">
      <CardHeader className="bg-red-600 text-white rounded-t-lg">
        <CardTitle>Configuración del Sistema</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label>{f.label}</Label>
              <Input
                name={f.key}
                defaultValue={config[f.key] ?? ''}
                placeholder={f.placeholder}
              />
            </div>
          ))}
          <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
