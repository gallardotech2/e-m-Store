'use client'

import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useBuyModal } from '@/hooks/use-buy-modal'

interface Product {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  precio_original: number | null
  imagen_url: string | null
  stock: number
}

export function SearchResults({
  products,
  query,
}: {
  products: Product[]
  query: string
}) {
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
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Volver al inicio
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product.id} className="flex items-center p-3 gap-4 border-0 shadow-sm">
              <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {product.imagen_url && (
                  <Image
                    src={product.imagen_url}
                    alt={product.nombre}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{product.nombre}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {product.descripcion ?? 'Producto de alta calidad'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-red-600">
                    Bs {product.precio.toLocaleString()}
                  </span>
                  {product.stock > 0 ? (
                    <span className="text-xs text-green-600">✓ Disponible</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Agotado</span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white shrink-0"
                onClick={() => openModal(product)}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Ver
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
