'use client'

import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { useBuyModal } from '@/hooks/use-buy-modal'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

export function ProductCompactCard({ product }: { product: Product }) {
  const { openModal } = useBuyModal()

  const descuento =
    product.precio_original && product.precio_original > product.precio
      ? Math.round((1 - product.precio / product.precio_original) * 100)
      : null

  return (
    <button
      onClick={() => openModal(product)}
      className="w-full text-left bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-200 group flex h-24"
    >
      <div className="relative w-24 h-full shrink-0 bg-gray-50">
        {product.imagen_url ? (
          <Image
            src={product.imagen_url}
            alt={product.nombre}
            fill
            className="object-cover"
            sizes="6rem"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <ShoppingCart className="h-7 w-7" />
          </div>
        )}
        {descuento && (
          <span className="absolute top-1 left-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            -{descuento}%
          </span>
        )}
      </div>
      <div className="flex flex-col justify-center min-w-0 px-2.5 py-2 flex-1">
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">
          {product.nombre}
        </h3>
            <p className="text-[11px] text-gray-400 whitespace-pre-line line-clamp-1 mt-0.5">
          {product.descripcion ?? 'Producto de alta calidad'}
        </p>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-sm font-bold text-red-600">
            Bs {formatPrice(product.precio)}
          </span>
          {product.precio_original && product.precio_original > product.precio && (
            <span className="text-[10px] text-gray-400 line-through">
              Bs {formatPrice(product.precio_original)}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
