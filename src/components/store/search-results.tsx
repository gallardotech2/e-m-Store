'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useBuyModal } from '@/hooks/use-buy-modal'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

export function SearchResults({
  products,
  query,
}: {
  products: Product[]
  query: string
}) {
  const router = useRouter()
  const { openModal } = useBuyModal()

  if (!query) return null

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-red-600">
        Resultados para &ldquo;{query}&rdquo; ({products.length} encontrados)
      </h2>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">No se encontraron productos</p>
          <Button variant="outline" onClick={() => router.push('/')}>
            Volver al inicio
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const descuento =
              product.precio_original && product.precio_original > product.precio
                ? Math.round((1 - product.precio / product.precio_original) * 100)
                : null

            return (
            <Card key={product.id} className="flex-row items-center p-3 gap-4 border-0 shadow-md">
              <div className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {product.imagen_url && (
                  <Image
                    src={product.imagen_url}
                    alt={product.nombre}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                )}
                {descuento && (
                  <Badge className="absolute top-1 left-1 bg-red-600 text-white font-bold text-xs">
                    -{descuento}%
                  </Badge>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{product.nombre}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-1">
                  {product.descripcion ?? 'Producto de alta calidad'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-red-600">
                    Bs {formatPrice(product.precio)}
                  </span>
                  {product.precio_original && product.precio_original > product.precio && (
                    <span className="text-xs text-muted-foreground line-through">
                      Bs {formatPrice(product.precio_original)}
                    </span>
                  )}
                  {product.stock > 0 ? (
                    <span className="text-xs text-green-600">✓ Disponible</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Agotado</span>
                  )}
                </div>
              </div>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white shrink-0 h-9 text-sm"
                onClick={() => openModal(product)}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Ver
              </Button>
            </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
