'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataTable, type Column } from '@/components/ui/data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { logAdminAction } from '@/lib/audit'

interface Category {
  id: number
  nombre: string
  slug: string
}

function EditDialog({ category }: { category: Category }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const nombre = form.get('nombre') as string
    const slug = form.get('slug') as string

    const { error } = await supabase
      .from('categories')
      .update({ nombre, slug })
      .eq('id', category.id)

    if (error) toast.error(error.message)
    else {
      await logAdminAction(supabase, {
        accion: 'update',
        tabla: 'categories',
        registro_id: category.id,
        datos_previos: { nombre: category.nombre, slug: category.slug },
        datos_nuevos: { nombre, slug },
      })
      toast.success('Categoría actualizada')
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="text-blue-600" />}>
        <Pencil className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Categoría</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input name="nombre" defaultValue={category.nombre} required />
          </div>
          <div className="space-y-2">
            <Label>Identificador</Label>
            <Input name="slug" defaultValue={category.slug} required />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Actualizar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CategoriesTable({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete(id: number) {
    const { error } = await supabase.from('categories').update({ activo: false }).eq('id', id)
    if (error) toast.error(error.message)
    else {
      await logAdminAction(supabase, {
        accion: 'delete',
        tabla: 'categories',
        registro_id: id,
        datos_nuevos: { activo: false },
      })
      toast.success('Categoría eliminada')
      router.refresh()
    }
  }

  const columns: Column<Category>[] = [
    { header: 'Nombre', accessorKey: 'nombre', sortable: true, searchable: true },
    { header: 'Identificador', accessorKey: 'slug', sortable: true },
    {
      header: 'Acciones',
      cell: (c) => (
        <div className="flex gap-1">
          <EditDialog category={c} />
          <ConfirmDialog
            title="Eliminar Categoría"
            description="¿Estás seguro de eliminar esta categoría?"
            confirmText="Eliminar"
            onConfirm={() => handleDelete(c.id)}
          >
            <Button variant="ghost" size="icon" className="text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </ConfirmDialog>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={categories}
      pageSize={10}
      searchPlaceholder="Buscar categoría..."
      emptyMessage="Sin categorías"
    />
  )
}
