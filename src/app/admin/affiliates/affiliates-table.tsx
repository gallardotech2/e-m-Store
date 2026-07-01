'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataTable, type Column } from '@/components/ui/data-table'
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
  status: string
  codigo_corto: string | null
  affiliate_links: { count: number }[]
  total_comisiones: number
}

function ActionButtons({ affiliate, onAction }: { affiliate: Affiliate, onAction: (id: string, action: 'aprobado' | 'rechazado' | 'pendiente') => void }) {
  if (affiliate.status === 'aprobado') {
    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
          onClick={() => onAction(affiliate.id, 'pendiente')}
        >
          Revocar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-600 hover:bg-red-50"
          onClick={() => onAction(affiliate.id, 'rechazado')}
        >
          Rechazar
        </Button>
      </div>
    )
  }

  if (affiliate.status === 'rechazado') {
    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          className="text-green-600 border-green-600 hover:bg-green-50"
          onClick={() => onAction(affiliate.id, 'aprobado')}
        >
          Aprobar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
          onClick={() => onAction(affiliate.id, 'pendiente')}
        >
          Reactivar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="outline"
        className="text-green-600 border-green-600 hover:bg-green-50"
        onClick={() => onAction(affiliate.id, 'aprobado')}
      >
        Aprobar
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 border-red-600 hover:bg-red-50"
        onClick={() => onAction(affiliate.id, 'rechazado')}
      >
        Rechazar
      </Button>
    </div>
  )
}

function GenerateLinkDialog({ affiliate }: { affiliate: Affiliate }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')

  async function handleGenerate() {
    setLoading(true)

    try {
      const res = await fetch('/api/admin/affiliate-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliate_id: affiliate.id }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Error al generar')
        return
      }

      const data = await res.json()
      setGeneratedCode(data.codigo_unico)
      toast.success('Código generado')
      router.refresh()
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
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
                Link: {window.location.origin}/?a={affiliate.codigo_corto}
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
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleAction(id: string, action: 'aprobado' | 'rechazado' | 'pendiente') {
    setLoading(id)
    try {
      const response = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, affiliate_id: id }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar')
      }

      toast.success(`Afiliado ${action === 'aprobado' ? 'aprobado' : 'rechazado'}`)
      router.refresh()
    } catch {
      toast.error('Error al actualizar el afiliado')
    } finally {
      setLoading(null)
    }
  }

  const columns: Column<Affiliate>[] = [
    { header: 'Nombre', accessorKey: 'nombre', sortable: true, searchable: true },
    { header: 'Correo', accessorKey: 'email', sortable: true, searchable: true },
    { header: 'Teléfono', accessorKey: 'telefono', searchable: true },
    {
      header: 'Estado',
      cell: (a) =>
        loading === a.id ? (
          <span className="text-xs text-muted-foreground">Actualizando...</span>
        ) : (
          <ActionButtons affiliate={a} onAction={handleAction} />
        ),
    },
    {
      header: 'Enlaces',
      cell: (a) => <>{a.affiliate_links?.[0]?.count ?? 0}</>,
    },
    {
      header: 'Ventas (Bs)',
      accessorKey: 'total_comisiones',
      sortable: true,
      cell: (a) => <span className="text-green-600 font-bold">Bs {formatPrice(a.total_comisiones)}</span>,
    },
    {
      header: 'Registro',
      accessorKey: 'fecha_registro',
      sortable: true,
      cell: (a) => (
        <span className="text-sm text-muted-foreground">
          {new Date(a.fecha_registro).toLocaleDateString('es-BO')}
        </span>
      ),
    },
    {
      header: 'Acción',
      cell: (a) => <GenerateLinkDialog affiliate={a} />,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={affiliates}
      pageSize={10}
      searchPlaceholder="Buscar afiliado..."
      emptyMessage="Sin afiliados"
    />
  )
}
