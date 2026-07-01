'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
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
} from '@/components/ui/dialog'
import { useBuyModal } from '@/hooks/use-buy-modal'
import { useAffiliate } from '@/hooks/use-affiliate'
import { buildWhatsAppUrl, buildPurchaseMessage } from '@/lib/whatsapp-utils'
import { useSystemConfigStore } from '@/hooks/use-system-config'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'

export function BuyModal() {
  const { isOpen, product, closeModal } = useBuyModal()
  const { afiliadoId } = useAffiliate()
  
  const { mensajeConfirmacion, setMensajeConfirmacion } = useSystemConfigStore()
  const router = useRouter()
  const [cliente, setCliente] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [loading, setLoading] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)

  useEffect(() => {
    if (isOpen && !mensajeConfirmacion) {
      const supabase = createClient()
      supabase
        .from('system_config')
        .select('valor')
        .eq('clave', 'mensaje_confirmacion')
        .single()
        .then(({ data }) => {
          if (data) setMensajeConfirmacion(data.valor)
        })
    }
  }, [isOpen, mensajeConfirmacion, setMensajeConfirmacion])

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
      toast.error('Enlace de afiliado no válido. Solicita un link oficial.')
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

      if (!data.telefono_afiliado) {
        toast.error('No se encontró teléfono del afiliado. Contacta al administrador.')
        setLoading(false)
        return
      }

      const mensaje = buildPurchaseMessage({
        producto: product.nombre,
        precio: product.precio,
        cliente: cliente.trim(),
        metodoPago,
        orderId: data.orderId,
        template: mensajeConfirmacion,
      })

      const waUrl = buildWhatsAppUrl(data.telefono_afiliado, mensaje)
      closeModal()
      window.open(waUrl, '_blank')
      router.refresh()
    } catch (e) {
      console.error('Error en handleBuy')
      toast.error('Error de conexión. Verifica tu internet e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-xl">
        {product.imagen_url ? (
          <div className="relative -mx-4 -mt-4 aspect-[4/3] md:hidden rounded-t-xl overflow-hidden">
            <Image
              src={product.imagen_url}
              alt={product.nombre}
              fill
              className="rounded-t-xl object-cover"
            />
          </div>
        ) : (
          <div className="md:hidden w-full -mx-4 -mt-4 aspect-[4/3] bg-gray-100 flex items-center justify-center rounded-t-xl overflow-hidden">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-5 items-start">
          <div className="hidden md:block shrink-0 self-center md:self-start">
            {product.imagen_url ? (
              <div className="relative w-32 h-32">
                <Image
                  src={product.imagen_url}
                  alt={product.nombre}
                  fill
                  className="rounded-lg object-contain"
                />
              </div>
            ) : (
              <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center space-y-2 min-w-0 text-left">
            <h2 className="text-lg md:text-2xl font-bold text-red-600 leading-tight">
              {product.nombre}
            </h2>
            <p className={`text-sm text-gray-500 ${descExpanded ? '' : 'line-clamp-2'}`}>
              {product.descripcion ?? 'Producto de alta calidad'}
            </p>
            {product.descripcion && (
              <button
                type="button"
                onClick={() => setDescExpanded(!descExpanded)}
                className="text-red-600 text-xs font-medium hover:underline text-left w-fit"
              >
                {descExpanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-xl md:text-2xl font-bold text-red-600">
                Bs {formatPrice(product.precio)}
              </span>
              {descuento && (
                <span className="text-sm text-gray-400 line-through">
                  Bs {formatPrice(product.precio_original ?? 0)}
                </span>
              )}
            </div>
            <div className="mt-1">
              <span className="inline-flex items-center text-[11px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                {product.duracion} días de duración
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm md:text-base font-medium">Nombre del Perfil</Label>
              <Input
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Aquí pon tu nombre"
                className="md:text-sm text-base md:h-8 h-12 md:py-1.5 py-3"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm md:text-base font-medium">Método de Pago</Label>
              <Select value={metodoPago} onValueChange={(v) => setMetodoPago(v ?? '')}>
                <SelectTrigger className="md:text-sm text-base md:h-8 h-12">
                  <SelectValue placeholder="Elige una opción..." />
                </SelectTrigger>
                <SelectContent side="bottom">
                  <SelectItem value="QR">QR</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                  <SelectItem value="Efectivo contra entrega">Efectivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 md:h-8 h-12 md:py-1.5 py-3 md:text-sm text-base" onClick={closeModal}>
              Volver
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white md:h-8 h-12 md:py-1.5 py-3 md:text-sm text-base"
              onClick={handleBuy}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Solicitar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
