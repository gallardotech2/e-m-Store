'use client'

import Image from 'next/image'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
    if (!confirm('¿Eliminar banner?')) return
    const { error } = await supabase.from('banners').update({ activo: false }).eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Banner eliminado')
      router.refresh()
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Orden</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                Sin banners
              </TableCell>
            </TableRow>
          ) : (
            banners.map((banner) => (
              <TableRow key={banner.id}>
                <TableCell>
                  <Image
                    src={banner.imagen_url}
                    alt={banner.titulo ?? 'Banner'}
                    width={80}
                    height={40}
                    className="rounded object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{banner.titulo ?? '—'}</TableCell>
                <TableCell>{banner.orden}</TableCell>
                <TableCell className="flex gap-1">
                  <EditDialog banner={banner} />
                  <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(banner.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
