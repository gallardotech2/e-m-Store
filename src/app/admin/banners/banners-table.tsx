'use client'

import Image from 'next/image'
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

interface Banner {
  id: number
  titulo: string | null
  imagen_url: string
  link: string | null
  orden: number
  products?: { nombre: string } | null
}

function EditDialog({ banner }: { banner: Banner }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const titulo = form.get('titulo') as string
    const orden = Number(form.get('orden'))

    const { error } = await supabase
      .from('banners')
      .update({ titulo: titulo || null, orden })
      .eq('id', banner.id)

    if (error) toast.error(error.message)
    else {
      await logAdminAction(supabase, {
        accion: 'update',
        tabla: 'banners',
        registro_id: banner.id,
        datos_previos: { titulo: banner.titulo, orden: banner.orden },
        datos_nuevos: { titulo: titulo || null, orden },
      })
      toast.success('Banner actualizado')
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
          <DialogTitle>Editar Banner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input name="titulo" defaultValue={banner.titulo ?? ''} />
          </div>
          <div className="space-y-2">
            <Label>Orden</Label>
            <Input name="orden" type="number" defaultValue={banner.orden} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Actualizar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function BannersTable({ banners }: { banners: Banner[] }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete(id: number) {
    const { error } = await supabase.from('banners').update({ activo: false }).eq('id', id)
    if (error) toast.error(error.message)
    else {
      await logAdminAction(supabase, {
        accion: 'delete',
        tabla: 'banners',
        registro_id: id,
        datos_nuevos: { activo: false },
      })
      toast.success('Banner eliminado')
      router.refresh()
    }
  }

  const columns: Column<Banner>[] = [
    {
      header: 'Imagen',
      cell: (b) => (
        <Image src={b.imagen_url} alt={b.titulo ?? 'Imagen de banner'} width={80} height={40} className="rounded object-cover" />
      ),
    },
    { header: 'Título', accessorKey: 'titulo', sortable: true, searchable: true },
    { header: 'Orden', accessorKey: 'orden', sortable: true },
    {
      header: 'Acciones',
      cell: (b) => (
        <div className="flex gap-1">
          <EditDialog banner={b} />
          <ConfirmDialog
            title="Eliminar Banner"
            description="¿Estás seguro de eliminar este banner?"
            confirmText="Eliminar"
            onConfirm={() => handleDelete(b.id)}
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
      data={banners}
      pageSize={10}
      searchPlaceholder="Buscar banner..."
      emptyMessage="Sin banners"
    />
  )
}
