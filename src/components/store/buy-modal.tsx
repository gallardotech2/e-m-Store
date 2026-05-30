'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { X, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useBuyModal } from '@/hooks/use-buy-modal'
import { useAffiliate } from '@/hooks/use-affiliate'
import { useWhatsApp } from '@/hooks/use-whatsapp'
import { toast } from 'sonner'

export function BuyModal() {
  const { isOpen, product, closeModal } = useBuyModal()
  const { afiliadoId } = useAffiliate()
  const { buildWhatsAppUrl, buildPurchaseMessage } = useWhatsApp()
  const router = useRouter()
  const [cliente, setCliente] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [loading, setLoading] = useState(false)

  if (!product) return null

  const descuento =
    product.precio_original && product.precio_original > product.precio
      ? Math.round((1 - product.precio / product.precio_original) * 100)
      : null

  async function handleBuy() {
    if (!product) return
    if (!cliente.trim()) {
      toast.error('Completa tu nombre')
      return
    }
    if (!metodoPago) {
      toast.error('Selecciona un método de pago')
      return
    }

    if (!afiliadoId) {
      toast.error('Este enlace de afiliado no está autorizado. Solo confía en afiliados oficiales.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto_id: product.id,
          cantidad: 1,
          total: product.precio,
          cliente_nombre: cliente.trim(),
          metodo_pago: metodoPago,
          afiliado_id: afiliadoId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Error al procesar la orden')
        setLoading(false)
        return
      }

      const phoneRes = await fetch(`/api/affiliates/phone?id=${afiliadoId}`)
      const phoneData = await phoneRes.json()

      if (!phoneData.telefono) {
        toast.error('El afiliado no tiene número configurado')
        setLoading(false)
        return
      }

      const mensaje = buildPurchaseMessage({
        producto: product.nombre,
        precio: product.precio,
        cliente: cliente.trim(),
        metodoPago,
        orderId: data.orderId,
      })

      const waUrl = buildWhatsAppUrl(phoneData.telefono, mensaje)
      closeModal()
      window.open(waUrl, '_blank')
      router.refresh()
    } catch {
      toast.error('Error al procesar la compra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-red-600">
            {product.nombre}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            {product.imagen_url ? (
              <Image
                src={product.imagen_url}
                alt={product.nombre}
                width={160}
                height={160}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>

          <div className="text-center">
            <span className="text-3xl font-bold text-red-600">
              Bs {product.precio.toLocaleString()}
            </span>
            {descuento && (
              <span className="text-lg text-muted-foreground line-through ml-2">
                Bs {product.precio_original?.toLocaleString()}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Nombre Completo</Label>
              <Input
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div className="space-y-1">
              <Label>Método de Pago</Label>
              <Select value={metodoPago} onValueChange={(v) => setMetodoPago(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige una opción..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QR">QR</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                  <SelectItem value="Efectivo contra entrega">Efectivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={closeModal}>
              Volver
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleBuy}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Pagar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
