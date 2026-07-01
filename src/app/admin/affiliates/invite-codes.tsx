'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Copy, Trash2, RefreshCw } from 'lucide-react'

export function InviteCodesTable({ codes }: { codes: { codigo: string; usado: boolean; usado_en: string | null; created_at: string }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)

    try {
      const res = await fetch('/api/admin/invite-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Error al generar')
        return
      }

      const data = await res.json()
      toast.success(`Código ${data.codigo} generado`)
      router.refresh()
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(codigo: string) {
    try {
      const res = await fetch(`/api/admin/invite-codes?codigo=${encodeURIComponent(codigo)}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Error al eliminar')
        return
      }

      toast.success('Código eliminado')
      router.refresh()
    } catch {
      toast.error('Error de conexión')
    }
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Códigos de Invitación</CardTitle>
        <Button onClick={handleGenerate} disabled={loading} size="sm">
          <RefreshCw className="h-4 w-4 mr-1" />
          {loading ? 'Generando...' : 'Generar Código'}
        </Button>
      </CardHeader>
      <CardContent>
        {codes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay códigos de invitación. Generá uno para que los afiliados se registren.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Usado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((c) => (
                  <TableRow key={c.codigo}>
                    <TableCell className="font-mono font-bold text-sm">{c.codigo}</TableCell>
                    <TableCell>
                      {c.usado ? (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Usado</span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Disponible</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.usado_en ? new Date(c.usado_en).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!c.usado && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              navigator.clipboard.writeText(c.codigo)
                              toast.success('Copiado')
                            }}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {!c.usado && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(c.codigo)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
