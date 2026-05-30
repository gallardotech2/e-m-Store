'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Copy, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface LinkItem {
  id: number
  codigo_unico: string
  clicks: number
  created_at: string
  products: { nombre: string; precio: number; imagen_url: string | null } | null
}

export function AffiliateLinksClient({
  links,
  products,
  afiliadoId,
}: {
  links: LinkItem[]
  products: { id: number; nombre: string }[]
  afiliadoId: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  async function handleGenerate() {
    setLoading(true)
    const code = `AF-${afiliadoId.slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`
    const { error } = await supabase.from('affiliate_links').insert({
      afiliado_id: afiliadoId,
      codigo_unico: code,
    })
    if (error) toast.error(error.message)
    else {
      toast.success('Link generado')
      router.refresh()
    }
    setLoading(false)
  }

  function copyLink(code: string, id: number) {
    const url = `${window.location.origin}/?ref=${code}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('Link copiado')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mis Links de Afiliado</h1>

      <Card className="border-0 shadow-md mb-8">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg">
          <CardTitle>Generar Nuevo Link</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Button onClick={handleGenerate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? 'Generando...' : 'Generar Link Genérico'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Se generará un link que podrás compartir. Todas las compras hechas desde ese link se te asignarán.
          </p>
        </CardContent>
      </Card>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No tienes links todavía. Genera tu primer link.
                </TableCell>
              </TableRow>
            ) : (
              links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-mono text-sm font-medium">{link.codigo_unico}</TableCell>
                  <TableCell>{link.clicks}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(link.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(link.codigo_unico, link.id)}
                    >
                      {copiedId === link.id ? (
                        <><Check className="h-3 w-3 mr-1" /> Copiado</>
                      ) : (
                        <><Copy className="h-3 w-3 mr-1" /> Copiar</>
                      )}
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
