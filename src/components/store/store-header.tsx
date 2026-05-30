'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search, ShoppingCart, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Category {
  id: number
  nombre: string
  slug: string
}

export function StoreHeader({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams()
  const a = searchParams.get('a')

  return (
    <header className="bg-red-600 text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-black tracking-tight">
            E-M Store
          </Link>

          <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-4">
            <form action="/" method="GET" className="flex w-full">
              {a && <input type="hidden" name="a" value={a} />}
              <Input
                name="buscar"
                placeholder="Buscar producto..."
                className="rounded-r-none bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Button type="submit" size="icon" className="rounded-l-none bg-white/20 hover:bg-white/30">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="text-white hover:bg-white/20" />}>
                Categorías
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.id} render={<Link href={`/?cat=${cat.id}${a ? `&a=${a}` : ''}`} />}>
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
      </div>
    </header>
  )
}
