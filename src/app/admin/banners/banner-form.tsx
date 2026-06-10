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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { logAdminAction } from '@/lib/audit'

interface Product {
  id: number
  nombre: string
}

export function BannerForm({ products }: { products: Product[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const titulo = form.get('titulo') as string
    const link = form.get('link') as string
    const producto_id = form.get('producto_id') ? Number(form.get('producto_id')) : null
    const orden = Number(form.get('orden'))
    const imagen = form.get('imagen') as File

    if (imagen.size === 0) {
      toast.error('Debe seleccionar una imagen')
      setLoading(false)
      return
    }

    const uploadForm = new FormData()
    uploadForm.append('file', imagen)
    uploadForm.append('bucket', 'banners')
    const res = await fetch('/api/upload', { method: 'POST', body: uploadForm })
    const uploadJson = await res.json()
    if (!res.ok) {
      toast.error(uploadJson.error || 'Error al subir imagen')
      setLoading(false)
      return
    }
    const imagen_url = uploadJson.url

    const { data: newBanner, error } = await supabase.from('banners').insert({
      titulo: titulo || null,
      link: link || null,
      producto_id,
      orden,
      imagen_url,
      activo: true,
    }).select('id').single()

    if (error) {
      toast.error(error.message)
    } else {
      await logAdminAction(supabase, {
        accion: 'create',
        tabla: 'banners',
        registro_id: newBanner?.id,
        datos_nuevos: { titulo, orden },
      })
      toast.success('Banner agregado correctamente')
      router.refresh()
      ;(e.target as HTMLFormElement).reset()
    }
    setLoading(false)
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-red-600 text-white rounded-t-lg">
        <CardTitle>Agregar Banner</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input name="titulo" />
            </div>
            <div className="space-y-2">
              <Label>Orden</Label>
              <Input name="orden" type="number" defaultValue={0} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Link (URL externa)</Label>
              <Input name="link" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>O enlazar a producto</Label>
              <Select name="producto_id">
                <SelectTrigger>
                  <SelectValue placeholder="Sin producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imagen</Label>
            <Input name="imagen" type="file" accept="image/*" required />
          </div>

          <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Banner'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
