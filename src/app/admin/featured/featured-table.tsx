'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { logAdminAction } from '@/lib/audit'

interface FeaturedItem {
  id: number
  producto_id: number
  orden: number
  activo: boolean
  products: { id: number; nombre: string; precio: number } | null
}

export function FeaturedTable({ items }: { items: FeaturedItem[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [updating, setUpdating] = useState<number | null>(null)
  const [orderInputs, setOrderInputs] = useState<Record<number, string>>({})

  async function handleRemove(id: number) {
    const res = await supabase.from('featured_products').delete().eq('id', id)
    if (res.error) {
      toast.error('Error al eliminar')
      return
    }
    await logAdminAction(supabase, {
      accion: 'delete',
      tabla: 'featured_products',
      registro_id: id,
    })
    toast.success('Producto eliminado de destacados')
    router.refresh()
  }

  async function handleUpdateOrden(id: number, orden: number) {
    setUpdating(id)
    const res = await supabase.from('featured_products').update({ orden }).eq('id', id)
    if (res.error) {
      toast.error('Error al actualizar orden')
    } else {
      await logAdminAction(supabase, {
        accion: 'update',
        tabla: 'featured_products',
        registro_id: id,
        datos_nuevos: { orden },
      })
      toast.success('Orden actualizado')
      router.refresh()
    }
    setUpdating(null)
  }

  if (!items.length) {
    return (
      <p className="text-gray-500 text-sm py-8 text-center">
        No hay productos destacados. Agrega uno arriba.
      </p>
    )
  }

  const sorted = [...items].sort((a, b) => a.orden - b.orden)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-3 font-medium">Producto</th>
            <th className="pb-3 font-medium">Precio</th>
            <th className="pb-3 font-medium w-24">Orden</th>
            <th className="pb-3 font-medium w-20">Acción</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => (
            <tr key={item.id} className="border-b last:border-0">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  {item.products?.nombre ?? 'Producto eliminado'}
                </div>
              </td>
              <td className="py-3 pr-4">
                Bs {item.products?.precio ? formatPrice(item.products.precio) : '-'}
              </td>
              <td className="py-3 pr-4">
                <Input
                  type="number"
                  min={0}
                  value={orderInputs[item.id] ?? String(item.orden)}
                  onChange={(e) => setOrderInputs((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  onBlur={(e) => {
                    const val = Number(e.target.value)
                    if (!isNaN(val) && val !== item.orden) {
                      handleUpdateOrden(item.id, val)
                    }
                    setOrderInputs((prev) => {
                      const next = { ...prev }
                      delete next[item.id]
                      return next
                    })
                  }}
                  disabled={updating === item.id}
                  className="h-8 w-20 text-sm"
                />
              </td>
              <td className="py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(item.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
