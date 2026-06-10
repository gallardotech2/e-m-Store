'use client'

import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Carousel3D } from '@/components/Carousel3D'
import type { CarouselImage } from '@/components/Carousel3D'

interface Banner {
  id: number
  imagen_url: string
  titulo: string | null
  link: string | null
  producto_id: number | null
}

interface Category {
  id: number
  nombre: string
  slug: string
}

export function BannerCarousel({ banners, categories }: { banners: Banner[]; categories: Category[] }) {

  function handleCategoryClick(catId: number) {
    document.getElementById(`cat-${catId}`)?.scrollIntoView({ behavior: 'smooth' })
  }

  if (banners.length === 0) {
    return (
      <section className="bg-[#1a1a2e] text-white py-16 text-center relative">
        <h1 className="text-5xl font-black mb-2 text-white">e-m Store</h1>
        <p className="text-xl font-bold text-white/60">Lo quieres, lo tienes · Envíos a todo Bolivia</p>
      </section>
    )
  }

  const images: CarouselImage[] = banners.map((b) => ({
    src: b.imagen_url,
    alt: b.titulo ?? 'Banner de e-m Store',
  }))

  return (
    <section className="w-full relative bg-[#1a1a2e]">
      <div className="hidden md:flex items-center justify-between absolute top-4 left-6 right-6 z-10">
        <h1 className="text-3xl font-black text-white">
          e-m Store
        </h1>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="text-white hover:bg-white/20" />}>
              Categorías
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {categories.map((cat) => (
                <DropdownMenuItem key={cat.id} onClick={() => handleCategoryClick(cat.id)}>
                  {cat.nombre}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/auth/login">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <UserPlus className="h-4 w-4 mr-2" />
              Afiliados
            </Button>
          </Link>
        </div>
      </div>
      <div className="relative z-[1]">
        <Carousel3D
          images={images}
          autoPlay
          interval={5000}
          loop
          showArrows
          showBullets
        />
      </div>
    </section>
  )
}
