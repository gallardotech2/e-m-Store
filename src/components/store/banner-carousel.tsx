'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Banner {
  id: number
  imagen_url: string
  titulo: string | null
  link: string | null
  producto_id: number | null
}

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (banners.length === 0) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 15000)
    return () => clearInterval(timer)
  }, [banners.length])

  if (banners.length === 0) {
    return (
      <section className="bg-gradient-to-r from-red-700 to-red-500 text-white py-16 text-center">
        <h1 className="text-5xl font-black mb-2">E-M Store</h1>
        <p className="text-xl font-bold opacity-90">Lo quieres, lo tienes · Envíos a todo Bolivia</p>
      </section>
    )
  }

  const banner = banners[current]

  return (
    <section className="relative overflow-hidden bg-gray-900" style={{ aspectRatio: '1080/400' }}>
      {banner.imagen_url && (
        <Image
          src={banner.imagen_url}
          alt={banner.titulo ?? 'Banner'}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 rounded-full h-10 w-10"
        onClick={() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 rounded-full h-10 w-10"
        onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            className={`h-2 w-2 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/50'}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </section>
  )
}
