'use client'

import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable, type Column } from '@/components/ui/data-table'
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

  async function handleStatusChange(orderId: number, estado: string, estadoAnterior: string) {
    const { error } = await supabase.from('orders').update({ estado }).eq('id', orderId)
    if (error) toast.error(error.message)
    else {
      await logAdminAction(supabase, {
        accion: 'update',
        tabla: 'orders',
        registro_id: orderId,
        datos_previos: { estado: estadoAnterior },
        datos_nuevos: { estado },
      })
      toast.success('Estado actualizado')
      router.refresh()
    }
  }

  const columns: Column<Order>[] = [
    {
      header: 'Pedido',
      accessorKey: 'id',
      sortable: true,
      cell: (o) => (
        <>
          <span className="font-mono text-xs">#{o.id}</span>
          <br />
          <span className="text-muted-foreground text-xs">
            {new Date(o.created_at).toLocaleDateString()}
          </span>
        </>
      ),
    },
    {
      header: 'Cliente',
      accessorKey: 'cliente_nombre',
      searchable: true,
      cell: (o) => (
        <>
          <div className="font-medium">{o.cliente_nombre ?? '—'}</div>
          <div className="text-xs text-muted-foreground">{o.telefono_cliente ?? '—'}</div>
        </>
      ),
    },
    {
      header: 'Producto',
      cell: (o) => <>{o.products?.nombre ?? '—'}</>,
    },
    { header: 'Cant.', accessorKey: 'cantidad' },
    {
      header: 'Total',
      accessorKey: 'total',
      sortable: true,
      cell: (o) => <span className="font-bold">Bs {formatPrice(Number(o.total))}</span>,
    },
    { header: 'Pago', accessorKey: 'metodo_pago' },
    {
      header: 'Afiliado',
      cell: (o) => <span className="text-sm">{o.profiles?.nombre ?? '—'}</span>,
    },
    {
      header: 'Estado',
      cell: (o) => (
        <Select
          key={`${o.id}-${o.estado}`}
          defaultValue={o.estado}
          onValueChange={(v) => handleStatusChange(o.id, v ?? 'pendiente', o.estado)}
        >
          <SelectTrigger className={`w-32 text-xs font-medium ${statusColors[o.estado] ?? ''}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="completado">Completado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={orders}
      pageSize={10}
      searchPlaceholder="Buscar por cliente..."
      emptyMessage="Sin pedidos"
    />
  )
}
