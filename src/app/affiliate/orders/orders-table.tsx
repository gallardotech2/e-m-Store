'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
}

const statusBadge: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  enviado: 'bg-blue-100 text-blue-800',
  completado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
}

export function AffiliateOrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No tienes pedidos aún
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
                <TableCell className="font-bold">Bs {Number(order.total).toLocaleString()}</TableCell>
                <TableCell className="text-sm">{order.metodo_pago ?? '—'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge[order.estado] ?? ''}`}>
                    {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
