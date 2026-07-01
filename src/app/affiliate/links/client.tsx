'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Copy, Check, Phone, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { phoneUpdateSchema } from '@/lib/validations/auth'

export function AffiliateLinksClient({
  afiliadoId,
  codigoCorto,
  telefono: initialTelefono,
  codigoPais,
  origin,
}: {
  afiliadoId: string
  codigoCorto: string
  telefono: string
  codigoPais: string
  origin: string
}) {
  const supabase = createClient()
  const [telefono, setTelefono] = useState(initialTelefono)
  const [savingPhone, setSavingPhone] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  function copyLink() {
    const url = `${origin}/?a=${codigoCorto}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
    toast.success('Link copiado')
  }

  async function handleSavePhone() {
    if (!telefono.trim()) {
      toast.error('Ingresa tu número de teléfono')
      return
    }
    const parsed = phoneUpdateSchema.safeParse({ telefono: telefono.trim() })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }
    setSavingPhone(true)
    const { error } = await supabase
      .from('profiles')
      .update(parsed.data)
      .eq('id', afiliadoId)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Teléfono actualizado')
    }
    setSavingPhone(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mis Links de Afiliado</h1>

      <Card className="border-0 shadow-md mb-8">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg">
          <CardTitle>Tu Link de Afiliado</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-100 p-2 rounded text-sm overflow-hidden text-ellipsis">
              {origin}/?a={codigoCorto}
            </code>
            <Button onClick={copyLink} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
              {copiedLink ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copiedLink ? 'Copiado' : 'Copiar'}
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Tu código:</span>
            <code className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">{codigoCorto}</code>
          </div>
          <p className="text-xs text-muted-foreground">
            Comparte este link. Todas las compras hechas desde él se te asignarán.
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md mb-8">
        <CardHeader className="bg-green-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Mi Número de WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Las compras realizadas desde tu link se enviarán a este número por WhatsApp.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium bg-gray-100 px-3 py-2 rounded">{codigoPais}</span>
            <Input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 71123456"
              className="flex-1"
            />
            <Button
              onClick={handleSavePhone}
              disabled={savingPhone || telefono === initialTelefono}
              className="bg-green-600 hover:bg-green-700 text-white shrink-0"
            >
              {savingPhone ? 'Guardando...' : <><Save className="h-4 w-4 mr-1" /> Guardar</>}
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
