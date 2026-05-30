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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Product {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  precio_original: number | null
  imagen_url: string | null
  stock: number
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

    const { error } = await supabase
      .from('products')
      .update({ nombre, descripcion, precio, stock })
      .eq('id', product.id)

    if (error) toast.error(error.message)
    else {
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Precio</Label>
              <Input name="precio" type="number" step="0.01" defaultValue={product.precio} required />
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input name="stock" type="number" defaultValue={product.stock} required />
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
    if (!confirm('¿Eliminar producto?')) return
    const { error } = await supabase.from('products').update({ activo: false }).eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Producto eliminado')
      router.refresh()
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                Sin productos
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.imagen_url ? (
                    <Image
                      src={product.imagen_url}
                      alt={product.nombre}
                      width={45}
                      height={45}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="w-[45px] h-[45px] bg-gray-200 rounded" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.nombre}</TableCell>
                <TableCell className="text-red-600 font-bold">
                  Bs {product.precio.toLocaleString()}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell className="flex gap-1">
                  <EditDialog product={product} />
                  <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(product.id)}>
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
