'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Copy, Check, RefreshCw, Phone, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface LinkItem {
  id: number
  codigo_unico: string
  clicks: number
  created_at: string
}

export function AffiliateLinksClient({
  afiliadoId,
  codigoCorto,
  telefono: initialTelefono,
  codigoPais,
  origin: string
}: {
  afiliadoId: string
  codigoCorto: string
  telefono: string
  codigoPais: string
  origin: string
}) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [links, setLinks] = useState<LinkItem[]>([])
  const [telefono, setTelefono] = useState(initialTelefono)
  const [savingPhone, setSavingPhone] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchLinks() {
      const { data } = await supabase
        .from('affiliate_links')
        .select('id, codigo_unico, clicks, created_at')
        .eq('afiliado_id', afiliadoId)
        .order('created_at', { ascending: false })
      if (!cancelled) setLinks(data ?? [])
    }
    fetchLinks()
    return () => { cancelled = true }
  }, [afiliadoId])

  async function refreshLinks() {
    const { data } = await supabase
      .from('affiliate_links')
      .select('id, codigo_unico, clicks, created_at')
      .eq('afiliado_id', afiliadoId)
      .order('created_at', { ascending: false })
    setLinks(data ?? [])
  }

  async function handleGenerate() {
    setLoading(true)
    const code = `AF-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
    const { data, error } = await supabase
      .from('affiliate_links')
      .insert({ afiliado_id: afiliadoId, codigo_unico: code })
      .select('id, codigo_unico, clicks, created_at')
      .single()
    if (error) {
      toast.error(error.message)
    } else if (data) {
      setLinks((prev) => [data, ...prev])
      toast.success('Link generado')
    }
    setLoading(false)
  }

  function copyLink() {
    const url = `${origin}/?a=${codigoCorto}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
    toast.success('Link copiado')
  }

  async function handleRegenerate(linkId: number) {
    setLoading(true)
    const newCode = `AF-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
    const { error } = await supabase
      .from('affiliate_links')
      .update({ codigo_unico: newCode })
      .eq('id', linkId)
      .eq('afiliado_id', afiliadoId)
    if (error) {
      toast.error(error.message)
    } else {
      setLinks((prev) =>
        prev.map((l) => (l.id === linkId ? { ...l, codigo_unico: newCode } : l))
      )
      toast.success('Código actualizado')
    }
    setLoading(false)
  }

  async function handleSavePhone() {
    if (!telefono.trim()) {
      toast.error('Ingresa tu número de teléfono')
      return
    }
    setSavingPhone(true)
    const { error } = await supabase
      .from('profiles')
      .update({ telefono: telefono.trim() })
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

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Códigos Generados</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshLinks}>
            <RefreshCw className="h-3 w-3 mr-1" /> Actualizar
          </Button>
          <Button size="sm" onClick={handleGenerate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? 'Generando...' : 'Generar Nuevo Código'}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No tienes códigos aún. Genera tu primer código.
                </TableCell>
              </TableRow>
            ) : (
              links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-mono text-sm font-medium">{link.codigo_unico}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(link.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRegenerate(link.id)}
                      disabled={loading}
                    >
                      Regenerar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
