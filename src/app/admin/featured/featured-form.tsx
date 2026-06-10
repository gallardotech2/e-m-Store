'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { logAdminAction } from '@/lib/audit'

interface Product {
  id: number
  nombre: string
}

export function FeaturedForm({ products }: { products: Product[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [productoId, setProductoId] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!productoId) {
      toast.error('Selecciona un producto')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('featured_products').insert({
      producto_id: Number(productoId),
      orden: 0,
    })
    setLoading(false)

    if (error) {
      toast.error('Error al agregar producto')
      return
    }

    await logAdminAction(supabase, {
      accion: 'create',
      tabla: 'featured_products',
      registro_id: productoId,
      datos_nuevos: { producto_id: Number(productoId) },
    })
    toast.success('Producto agregado a destacados')
    setProductoId('')
    router.refresh()
  }

  if (!products.length) {
    return (
      <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
        Todos los productos ya están en destacados o no hay productos disponibles.
      </p>
    )
  }

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1 space-y-1">
        <label className="text-sm font-medium text-gray-700">Agregar producto</label>
        <Select value={productoId} onValueChange={(v) => setProductoId(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un producto..." />
          </SelectTrigger>
          <SelectContent side="bottom">
            {products.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleAdd} disabled={loading || !productoId}>
        <Plus className="h-4 w-4 mr-2" />
        Agregar
      </Button>
    </div>
  )
}
