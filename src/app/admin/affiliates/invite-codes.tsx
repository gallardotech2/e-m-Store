'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Copy, Trash2, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { logAdminAction } from '@/lib/audit'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCode(): string {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += CHARS[bytes[i] % CHARS.length]
  }
  return code
}

export function InviteCodesTable({ codes }: { codes: { codigo: string; usado: boolean; usado_en: string | null; created_at: string }[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    const code = generateCode()
    const { error } = await supabase.from('invite_codes').insert({ codigo: code })

    if (error) {
      toast.error(error.message)
    } else {
      await logAdminAction(supabase, {
        accion: 'create',
        tabla: 'invite_codes',
        registro_id: code,
        datos_nuevos: { codigo: code },
      })
      toast.success(`Código ${code} generado`)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDelete(codigo: string) {
    const { error } = await supabase.from('invite_codes').delete().eq('codigo', codigo)
    if (error) {
      toast.error(error.message)
    } else {
      await logAdminAction(supabase, {
        accion: 'delete',
        tabla: 'invite_codes',
        registro_id: codigo,
        datos_previos: { codigo },
      })
      router.refresh()
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
        )}
      </CardContent>
    </Card>
  )
}
