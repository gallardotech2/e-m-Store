import { createClient } from '@/lib/supabase/server'
import { BannersTable } from './banners-table'
import { BannerForm } from './banner-form'

export default async function AdminBannersPage() {
  const supabase = await createClient()

  const [{ data: banners }, { data: products }] = await Promise.all([
    supabase.from('banners').select('*, products(nombre)').eq('activo', true).order('orden'),
    supabase.from('products').select('id, nombre').eq('activo', true).order('nombre'),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Banners</h1>
      <BannerForm products={products ?? []} />
      <div className="mt-8">
        <BannersTable banners={banners ?? []} />
      </div>
    </div>
  )
}
