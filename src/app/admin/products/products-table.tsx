'use client'

import Image from 'next/image'
import { Pencil, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { DataTable, type Column } from '@/components/ui/data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { logAdminAction } from '@/lib/audit'

interface Product {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  precio_original: number | null
  imagen_url: string | null
  stock: number
  duracion: number
  categories?: { nombre: string } | null
}

function EditDialog({ product }: { product: Product }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const nombre = form.get('nombre') as string
    const descripcion = form.get('descripcion') as string
    const precio = Number(form.get('precio'))
    const stock = Number(form.get('stock'))
    const duracion = Number(form.get('duracion')) || 28

    const { error } = await supabase
      .from('products')
      .update({ nombre, descripcion, precio, stock, duracion })
      .eq('id', product.id)

    if (error) toast.error(error.message)
    else {
      await logAdminAction(supabase, {
        accion: 'update',
        tabla: 'products',
        registro_id: product.id,
        datos_previos: { nombre: product.nombre, precio: product.precio, stock: product.stock, duracion: product.duracion },
        datos_nuevos: { nombre, descripcion, precio, stock, duracion },
      })
      toast.success('Producto actualizado')
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
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input name="nombre" defaultValue={product.nombre} required />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea name="descripcion" defaultValue={product.descripcion ?? ''} rows={3} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Precio</Label>
              <Input name="precio" type="number" step="0.01" defaultValue={product.precio} required />
            </div>
            <div className="space-y-2">
              <Label>Inventario</Label>
              <Input name="stock" type="number" defaultValue={product.stock} required />
            </div>
            <div className="space-y-2">
              <Label>Duración (días)</Label>
              <Input name="duracion" type="number" defaultValue={product.duracion} />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Actualizar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete(id: number) {
    const { error } = await supabase.from('products').update({ activo: false }).eq('id', id)
    if (error) toast.error(error.message)
    else {
      await logAdminAction(supabase, {
        accion: 'delete',
        tabla: 'products',
        registro_id: id,
        datos_nuevos: { activo: false },
      })
      toast.success('Producto eliminado')
      router.refresh()
    }
  }

  const columns: Column<Product>[] = [
    {
      header: 'Imagen',
      cell: (p) =>
        p.imagen_url ? (
          <Image src={p.imagen_url} alt={p.nombre} width={45} height={45} className="rounded object-cover" />
        ) : (
          <div className="w-[45px] h-[45px] bg-gray-200 rounded" />
        ),
    },
    { header: 'Producto', accessorKey: 'nombre', sortable: true, searchable: true },
    {
      header: 'Precio',
      accessorKey: 'precio',
      sortable: true,
      cell: (p) => <span className="text-red-600 font-bold">Bs {formatPrice(p.precio)}</span>,
    },
    {
      header: 'Inventario',
      accessorKey: 'stock',
      sortable: true,
      cell: (p) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
        >
          {p.stock}
        </span>
      ),
    },
    {
      header: 'Duración',
      accessorKey: 'duracion',
      sortable: true,
      cell: (p) => <span className="text-sm text-muted-foreground">{p.duracion} días</span>,
    },
    {
      header: 'Acciones',
      cell: (p) => (
        <div className="flex gap-1">
          <EditDialog product={p} />
          <ConfirmDialog
            title="Eliminar Producto"
            description="¿Estás seguro de eliminar este producto?"
            confirmText="Eliminar"
            onConfirm={() => handleDelete(p.id)}
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
      data={products}
      pageSize={10}
      searchPlaceholder="Buscar producto..."
      emptyMessage="Sin productos"
    />
  )
}
