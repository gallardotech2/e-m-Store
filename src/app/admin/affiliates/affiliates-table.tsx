'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Affiliate {
  id: string
  nombre: string
  email: string
  telefono: string | null
  fecha_registro: string
  affiliate_links: { count: number }[]
  total_comisiones: number
}

function GenerateLinkDialog({ affiliate }: { affiliate: Affiliate }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')

  async function handleGenerate() {
    setLoading(true)
    const code = `AF-${affiliate.id.slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`
    const { error } = await supabase.from('affiliate_links').insert({
      afiliado_id: affiliate.id,
      codigo_unico: code,
    })

    if (error) {
      toast.error(error.message)
    } else {
      setGeneratedCode(code)
      toast.success('Código generado')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setGeneratedCode('') }}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Generar Código
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generar Código de Afiliado</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Para: <strong>{affiliate.nombre}</strong>
          </p>
          {generatedCode ? (
            <div className="space-y-2">
              <Label>Código generado</Label>
              <Input value={generatedCode} readOnly />
              <p className="text-xs text-muted-foreground">
                Link: {window.location.origin}/?ref={generatedCode}
              </p>
            </div>
          ) : (
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? 'Generando...' : 'Generar Código'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AffiliatesTable({ affiliates }: { affiliates: Affiliate[] }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Links</TableHead>
            <TableHead>Ventas (Bs)</TableHead>
            <TableHead>Registro</TableHead>
            <TableHead>Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {affiliates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Sin afiliados
              </TableCell>
            </TableRow>
          ) : (
            affiliates.map((aff) => (
              <TableRow key={aff.id}>
                <TableCell className="font-medium">{aff.nombre}</TableCell>
                <TableCell>{aff.email}</TableCell>
                <TableCell>{aff.telefono ?? '—'}</TableCell>
                <TableCell>{aff.affiliate_links?.[0]?.count ?? 0}</TableCell>
                <TableCell className="text-green-600 font-bold">
                  Bs {aff.total_comisiones.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(aff.fecha_registro).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <GenerateLinkDialog affiliate={aff} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
