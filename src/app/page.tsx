import { createClient } from '@/lib/supabase/server'
import { StoreHeader } from '@/components/store/store-header'
import { BannerCarousel } from '@/components/store/banner-carousel'
import { ProductGrid } from '@/components/store/product-grid'
import { SearchResults } from '@/components/store/search-results'
import { BottomNav } from '@/components/store/bottom-nav'
import { BuyModal } from '@/components/store/buy-modal'

interface PageProps {
  searchParams: Promise<{ buscar?: string; cat?: string; a?: string; todo?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('activo', true)
    .order('nombre')

  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .eq('activo', true)
    .order('orden')
    .order('id', { ascending: false })

  const buscar = sp.buscar?.trim() ?? ''
  const catId = sp.cat ? Number(sp.cat) : null
  const mostrarTodo = sp.todo === '1'

  let products: any[] = []

  if (buscar && buscar.length >= 2) {
    const { data } = await supabase
      .from('products')
      .select('*, categories(nombre)')
      .eq('activo', true)
      .or(`nombre.ilike.%${buscar}%,descripcion.ilike.%${buscar}%`)
      .order('nombre')
    products = data ?? []
  } else if (catId) {
    const { data } = await supabase
      .from('products')
      .select('*, categories(nombre)')
      .eq('activo', true)
      .eq('categoria_id', catId)
      .order('created_at', { ascending: false })
    products = data ?? []
  }

  return (
    <>
      <StoreHeader categories={categories ?? []} />
      {!buscar && <BannerCarousel banners={banners ?? []} />}
      <main className="flex-1">
        <ProductGrid
          categories={categories ?? []}
          buscar={buscar}
          catId={catId}
          mostrarTodo={mostrarTodo}
        />
        {buscar && (
          <div className="container mx-auto px-4 pb-8">
            <SearchResults products={products} query={buscar} />
          </div>
        )}
      </main>
      <BottomNav />
      <BuyModal />
    </>
  )
}
