'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

interface Category {
  id: number
  nombre: string
}

export function ProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const nombre = form.get('nombre') as string
    const descripcion = form.get('descripcion') as string
    const precio = Number(form.get('precio'))
    const precio_original = form.get('precio_original') ? Number(form.get('precio_original')) : null
    const categoria_id = form.get('categoria_id') ? Number(form.get('categoria_id')) : null
    const stock = Number(form.get('stock'))
    const duracion = Number(form.get('duracion')) || 28
    const precio_envio = Number(form.get('precio_envio'))
    const imagen = form.get('imagen') as File

    if (precio_original && precio_original <= precio) {
      toast.error('El precio original debe ser mayor al precio')
      setLoading(false)
      return
    }

    let imagen_url = ''

    if (imagen.size > 0) {
      const uploadForm = new FormData()
      uploadForm.append('file', imagen)
      uploadForm.append('bucket', 'products')
      const res = await fetch('/api/upload', { method: 'POST', body: uploadForm })
      const uploadJson = await res.json()
      if (!res.ok) {
        toast.error(uploadJson.error || 'Error al subir imagen')
        setLoading(false)
        return
      }
      imagen_url = uploadJson.url
    }

    const envio_opciones = [
      form.get('envio_gratis') ? 'gratis' : '',
      form.get('envio_online') ? 'online' : '',
      form.get('envio_recojo') ? 'recojo' : '',
    ].filter(Boolean).join(',')

    const { data: newProduct, error } = await supabase.from('products').insert({
      nombre,
      descripcion,
      precio,
      precio_original,
      categoria_id,
      stock,
      duracion,
      precio_envio,
      envio_opciones,
      imagen_url,
      activo: true,
    }).select('id').single()

    if (error) {
      toast.error(error.message)
    } else {
      await logAdminAction(supabase, {
        accion: 'create',
        tabla: 'products',
        registro_id: newProduct?.id,
        datos_nuevos: { nombre, precio, stock, categoria_id },
      })
      toast.success('Producto agregado correctamente')
      router.refresh()
      ;(e.target as HTMLFormElement).reset()
    }
    setLoading(false)
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-red-600 text-white rounded-t-lg">
        <CardTitle>Agregar Producto</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input name="nombre" required />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select name="categoria_id">
                <SelectTrigger>
                  <SelectValue placeholder="Sin categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea name="descripcion" rows={3} />
          </div>

          <div className="space-y-2">
            <Label className="text-red-600 font-bold">Precio Original (Bs)</Label>
            <Input name="precio_original" type="number" step="0.01" className="border-red-400" />
          </div>
          <div className="space-y-2">
            <Label className="text-green-600 font-bold">Precio (Bs)</Label>
            <Input name="precio" type="number" step="0.01" className="border-green-400" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Inventario</Label>
              <Input name="stock" type="number" defaultValue={10} required />
            </div>
            <div className="space-y-2">
              <Label>Duración (días)</Label>
              <Input name="duracion" type="number" defaultValue={28} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Envío (Bs)</Label>
              <Input name="precio_envio" type="number" step="0.01" defaultValue={0} />
            </div>
            <div className="space-y-2">
              <Label>Opciones de Entrega</Label>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="envio_gratis" className="rounded" />
                  Envío Gratis
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="envio_online" className="rounded" />
                  Pago Online
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="envio_recojo" className="rounded" />
                  Recojo en Tienda
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imagen</Label>
            <Input name="imagen" type="file" accept="image/*" />
          </div>

          <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
