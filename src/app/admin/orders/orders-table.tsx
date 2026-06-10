'use client'

import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { logAdminAction } from '@/lib/audit'

interface Order {
  id: number
  cantidad: number
  total: number
  telefono_cliente: string | null
  cliente_nombre: string | null
  metodo_pago: string | null
  estado: string
  created_at: string
  products: { nombre: string; precio: number } | null
  profiles: { nombre: string; email: string } | null
}

const statusColors: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  enviado: 'bg-blue-100 text-blue-800',
  completado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleStatusChange(orderId: number, estado: string) {
    const { data: oldOrder } = await supabase
      .from('orders')
      .select('estado')
      .eq('id', orderId)
      .single()
    const { error } = await supabase.from('orders').update({ estado }).eq('id', orderId)
    if (error) toast.error(error.message)
    else {
      await logAdminAction(supabase, {
        accion: 'update',
        tabla: 'orders',
        registro_id: orderId,
        datos_previos: oldOrder ? { estado: oldOrder.estado } : null,
        datos_nuevos: { estado },
      })
      toast.success('Estado actualizado')
      router.refresh()
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Cant.</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>Afiliado</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                Sin pedidos
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">
                  #{order.id}
                  <br />
                  <span className="text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{order.cliente_nombre ?? '—'}</div>
                  <div className="text-xs text-muted-foreground">{order.telefono_cliente ?? '—'}</div>
                </TableCell>
                <TableCell>{order.products?.nombre ?? '—'}</TableCell>
                <TableCell>{order.cantidad}</TableCell>
                <TableCell className="font-bold">
                  Bs {formatPrice(Number(order.total))}
                </TableCell>
                <TableCell className="text-sm">{order.metodo_pago ?? '—'}</TableCell>
                <TableCell className="text-sm">
                  {order.profiles?.nombre ?? '—'}
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={order.estado}
                    onValueChange={(v) => handleStatusChange(order.id, v ?? 'pendiente')}
                  >
                    <SelectTrigger className={`w-32 text-xs font-medium ${statusColors[order.estado] ?? ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="enviado">Enviado</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
