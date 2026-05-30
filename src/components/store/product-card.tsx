'use client'

import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAffiliate } from '@/hooks/use-affiliate'
import { useBuyModal } from '@/hooks/use-buy-modal'

interface Product {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  precio_original: number | null
  imagen_url: string | null
  stock: number
  precio_envio: number
  envio_opciones: string
}

export function ProductCard({ product }: { product: Product }) {
  const { getAffiliateParam } = useAffiliate()
  const { openModal } = useBuyModal()

  const descuento =
    product.precio_original && product.precio_original > product.precio
      ? Math.round((1 - product.precio / product.precio_original) * 100)
      : null

  const envioGratis = product.envio_opciones?.includes('gratis')

  return (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
      <div className="relative aspect-square bg-gray-100">
        {product.imagen_url ? (
          <Image
            src={product.imagen_url}
            alt={product.nombre}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <ShoppingCart className="h-12 w-12" />
          </div>
        )}
        {descuento && (
          <Badge className="absolute top-2 left-2 bg-red-600 text-white font-bold">
            -{descuento}%
          </Badge>
        )}
      </div>
      <CardContent className="p-3 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2">{product.nombre}</h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-red-600">
            Bs {product.precio.toLocaleString()}
          </span>
          {product.precio_original && product.precio_original > product.precio && (
            <span className="text-sm text-muted-foreground line-through">
              Bs {product.precio_original.toLocaleString()}
            </span>
          )}
        </div>
        {envioGratis && (
          <p className="text-xs text-green-600 font-medium">Envío Gratis</p>
        )}
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          size="sm"
          onClick={() => openModal(product)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          VER AHORA
        </Button>
      </CardContent>
    </Card>
  )
}
