'use client'

import Image from 'next/image'
import { ShoppingCart, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useBuyModal } from '@/hooks/use-buy-modal'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

interface FeaturedItem {
  id: number
  producto_id: number
  products: Product | null
}

export function FeaturedCarousel({ items }: { items: FeaturedItem[] }) {
  const { openModal } = useBuyModal()

  const validItems = items.filter((i) => i.products)
  if (!validItems.length) return null

  return (
    <section className="py-8 bg-gradient-to-r from-red-50 via-orange-50 to-red-50 border-y border-red-100">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-black text-gray-800 mb-5 flex items-center gap-2">
          <Star className="h-5 w-5 text-red-500 fill-red-500" />
          Destacados
        </h2>
        <Carousel
          plugins={[
            Autoplay({
              delay: 8000,
              playOnInit: true,
              stopOnInteraction: false,
              stopOnMouseEnter: false,
            }),
          ]}
          opts={{
            loop: validItems.length > 1,
            align: 'center',
          }}
          className="w-full"
        >
          <CarouselContent>
            {validItems.map((item) => {
              const p = item.products!
              const descuento =
                p.precio_original && p.precio_original > p.precio
                  ? Math.round((1 - p.precio / p.precio_original) * 100)
                  : null

              return (
                <CarouselItem key={item.id}>
                    <div className="bg-white rounded-xl shadow-lg border-2 border-red-100 overflow-hidden flex flex-col sm:flex-row min-h-[420px]">
                    <div className="relative w-full sm:w-80 h-72 sm:h-auto bg-gray-50 shrink-0">
                      <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="h-3 w-3 fill-white" />
                        DESTACADO
                      </span>
                      {p.imagen_url ? (
                        <Image
                          src={p.imagen_url}
                          alt={p.nombre}
                          fill
                          className="object-cover p-0"
                          sizes="(max-width: 640px) 100vw, 12rem"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-300">
                          <ShoppingCart className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between p-5 sm:p-8 flex-1 min-w-0">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-2">
                          {p.nombre}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-3 mb-3">
                          {p.descripcion || 'Producto de alta calidad'}
                        </p>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-2xl sm:text-3xl font-bold text-red-600">
                            Bs {formatPrice(p.precio)}
                          </span>
                          {descuento && (
                            <>
                              <span className="text-sm text-gray-400 line-through">
                                Bs {formatPrice(p.precio_original ?? 0)}
                              </span>
                              <Badge className="bg-red-600 text-white text-xs">
                                -{descuento}%
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        className="w-fit bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-5 text-sm"
                        onClick={() => openModal(p)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        VER AHORA
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>
          {validItems.length > 1 && (
            <>
              <CarouselPrevious className="hidden md:flex left-1" />
              <CarouselNext className="hidden md:flex right-1" />
            </>
          )}
        </Carousel>
      </div>
    </section>
  )
}
