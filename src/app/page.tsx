import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BannerCarousel } from '@/components/store/banner-carousel'
import { CategoryTags } from '@/components/store/category-tags'
import { CompactProductGrid } from '@/components/store/compact-product-grid'
import { FeaturedCarousel } from '@/components/store/featured-carousel'
import { ProductGrid } from '@/components/store/product-grid'
import { SearchResults } from '@/components/store/search-results'
import { BottomNav } from '@/components/store/bottom-nav'
import { ModalWrapper } from '@/components/store/modal-wrapper'
import { Product } from '@/types'

const raw = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const siteUrl = raw.startsWith('http') ? raw : `https://${raw}`

export const metadata: Metadata = {
  title: 'e-m Store — Perfiles de streaming legales en Bolivia',
  description:
    'Descubre cómo tener tu perfil exclusivo de streaming pagando desde 30 bolivianos. Acceso único con PIN personal, calidad 4K, 100% legal. Ahorra más del 60%.',
  openGraph: {
    title: 'e-m Store — Perfiles de streaming legales en Bolivia',
    description:
      'Descubre cómo tener tu perfil exclusivo de streaming pagando desde 30 bolivianos. Acceso único con PIN, calidad 4K, 100% legal. Ahorra más del 60%.',
    url: siteUrl,
  },
}

interface PageProps {
  searchParams: Promise<{ buscar?: string; cat?: string; a?: string; todo?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const supabase = await createClient()

  const [categoriesResult, bannersResult, featuredResult, productsResult] = await Promise.all([
    supabase.from('categories').select('id, nombre, slug').eq('activo', true).order('nombre'),
    supabase.from('banners').select('id, imagen_url, titulo, link, producto_id, orden').eq('activo', true).order('orden').order('id', { ascending: false }),
    supabase.from('featured_products').select('*, products(*)').eq('activo', true).order('orden'),
    supabase.from('products').select('*').eq('activo', true).order('created_at', { ascending: false }),
  ])

  if (categoriesResult.error) console.error('Error categorías:', categoriesResult.error.message)
  if (bannersResult.error) console.error('Error banners:', bannersResult.error.message)
  if (featuredResult.error) console.error('Error destacados:', featuredResult.error.message)
  if (productsResult.error) console.error('Error productos:', productsResult.error.message)

  const categories = categoriesResult.data ?? []
  const banners = bannersResult.data ?? []
  const featured = featuredResult.data ?? []
  const allProducts = productsResult.data ?? []

  const hasCriticalError = categoriesResult.error && productsResult.error
  const hasPartialError = !hasCriticalError && (categoriesResult.error || bannersResult.error || featuredResult.error || productsResult.error)

  const buscar = sp.buscar?.trim() ?? ''

  let searchResults: Product[] = []

  if (buscar && buscar.length >= 2) {
    const safeBuscar = buscar.replace(/[()%,._]/g, '')
    if (safeBuscar) {
      const { data } = await supabase
        .from('products')
        .select('*, categories(nombre)')
        .eq('activo', true)
        .or(`nombre.ilike.%${safeBuscar}%,descripcion.ilike.%${safeBuscar}%`)
        .order('nombre')
      searchResults = data ?? []
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'e-m store',
    description:
      'Perfiles de streaming legales en Bolivia. Acceso exclusivo con PIN personal, calidad 4K.',
    url: siteUrl,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'BOB',
      priceRange: '30-33',
      description: 'Perfiles individuales de streaming desde 30 bolivianos',
    },
  }

  if (hasCriticalError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-gray-600 text-lg">Algo salió mal al cargar la tienda</p>
        <a href="/" className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors">
          Intentar de nuevo
        </a>
      </div>
    )
  }

  return (
    <>
      {hasPartialError && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 px-4 py-2.5 text-sm text-center">
          Algunos elementos no se cargaron correctamente.
        </div>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {!buscar && <BannerCarousel banners={banners} categories={categories} />}
      <main className="flex-1">
        {buscar ? (
          <div className="container mx-auto px-4 pb-8">
            <SearchResults products={searchResults} query={buscar} />
          </div>
        ) : (
          <>
            <section className="py-6" id="categorias-scroll">
              <div className="container mx-auto px-4 space-y-4">
                <CategoryTags categories={categories} />
                <CompactProductGrid products={allProducts} />
              </div>
            </section>
            <FeaturedCarousel items={featured} />
            <ProductGrid
              categories={categories}
              buscar={buscar}
              catId={null}
              mostrarTodo={false}
              products={allProducts}
            />
          </>
        )}
      </main>
      <BottomNav affiliateId={sp.a ?? null} />
      <ModalWrapper categories={categories} />
    </>
  )
}
