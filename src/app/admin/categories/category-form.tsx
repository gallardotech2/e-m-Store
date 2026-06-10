'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { logAdminAction } from '@/lib/audit'

export function CategoryForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
  }

  function handleSlug(e: React.ChangeEvent<HTMLInputElement>) {
    const slugInput = document.querySelector<HTMLInputElement>('input[name="slug"]')
    if (slugInput) slugInput.value = slugify(e.target.value)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const nombre = form.get('nombre') as string
    const slug = form.get('slug') as string

    const { data: newCat, error } = await supabase.from('categories').insert({
      nombre,
      slug: slug || slugify(nombre),
      activo: true,
    }).select('id').single()

    if (error) {
      toast.error(error.message)
    } else {
      await logAdminAction(supabase, {
        accion: 'create',
        tabla: 'categories',
        registro_id: newCat?.id,
        datos_nuevos: { nombre, slug },
      })
      toast.success('Categoría agregada correctamente')
      router.refresh()
      ;(e.target as HTMLFormElement).reset()
    }
    setLoading(false)
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-red-600 text-white rounded-t-lg">
        <CardTitle>Agregar Categoría</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input name="nombre" onChange={handleSlug} required />
            </div>
            <div className="space-y-2">
              <Label>Identificador</Label>
              <Input name="slug" placeholder="Auto-generado" />
            </div>
          </div>
          <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Categoría'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
