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

  return (
    <>
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
